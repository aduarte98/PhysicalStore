import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Store } from '../store/interfaces/store.interface';
import { MapsService } from '../shipping/maps.service';
import { MelhorEnvioService } from '../shipping/melhorenvio.service';
import { ViaCepService } from '../cep/viacep.service';
import { logger } from '../../utils/logger';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel('Store') private storeModel: Model<Store>,
    private readonly mapsService: MapsService,
    private readonly melhorEnvio: MelhorEnvioService,
    private readonly viaCep: ViaCepService,
  ) {}

  async getAllStores() {
    return this.storeModel.find();
  }

  async findByCep(cep: string) {
    try {
      logger.info(`🔎 Iniciando busca por lojas próximas ao CEP ${cep}`);

      const location = await this.viaCep.getCoordinatesFromCep(cep);
      const pdvs = await this.storeModel.find({ type: 'PDV' });

      const response: any[] = [];

      for (const pdv of pdvs) {
        const distance = await this.mapsService.getDistanceBetween(
          { latitude: pdv.latitude, longitude: pdv.longitude },
          { latitude: location.latitude, longitude: location.longitude },
        );

        const isWithin50km = distance.distanceInKm <= 50;

        if (isWithin50km) {
          const deliveryTime = await this.melhorEnvio.getDeliveryTime(
            pdv.storeID,
            { ...location, postalCode: cep },
            true,
            { postalCode: pdv.postalCode },
          );

          response.push({
            name: pdv.storeName,
            city: pdv.city,
            postalCode: pdv.postalCode,
            type: "PDV",
            distance: `${distance.distanceInKm.toFixed(1)} km`,
            rawDistance: distance.distanceInKm,
            value: [
              {
                prazo: `${deliveryTime} dia${Number(deliveryTime) > 1 ? 's' : ''} úteis`,
                price: "R$ 15,00",
                description: "Motoboy"
              }
            ]
          });

          logger.info(`✅ Loja PDV encontrada: ${pdv.storeName} - ${distance.distanceInKm.toFixed(1)} km`);
        } else {
          const loja = await this.storeModel.findOne({
            'associatedPDV.storeID': pdv.storeID,
            type: 'loja',
          });

          if (loja) {
            const pdvAssociada = await this.storeModel.findOne({
              storeID: loja.associatedPDV?.storeID,
              type: 'PDV',
            });

            let shippingMethods: { apac?: { price: any; deliveryTime: any }; sedex?: { price: any; deliveryTime: any } } | null = null;
            if (pdvAssociada) {
              shippingMethods = await this.melhorEnvio.getFreteFromLoja(
                { postalCode: pdvAssociada.postalCode },
                { postalCode: cep },
              );
            }

            if (shippingMethods?.sedex && shippingMethods?.apac) {
              response.push({
                name: loja.storeName,
                city: loja.city,
                postalCode: loja.postalCode,
                type: "LOJA",
                distance: `${distance.distanceInKm.toFixed(1)} km`,
                rawDistance: distance.distanceInKm,
                value: [
                  {
                    prazo: `${shippingMethods.sedex.deliveryTime} dia${shippingMethods.sedex.deliveryTime > 1 ? 's' : ''} úteis`,
                    codProdutoAgencia: "04014",
                    price: `R$ ${Number(shippingMethods.sedex.price).toFixed(2).replace('.', ',')}`,
                    description: "Sedex a encomenda expressa dos Correios"
                  },
                  {
                    prazo: `${shippingMethods.apac.deliveryTime} dia${shippingMethods.apac.deliveryTime > 1 ? 's' : ''} úteis`,
                    codProdutoAgencia: "04510",
                    price: `R$ ${Number(shippingMethods.apac.price).toFixed(2).replace('.', ',')}`,
                    description: "PAC a encomenda econômica dos Correios"
                  }
                ]
              });

              logger.info(`✅ Loja online encontrada: ${loja.storeName} via PDV ${pdv.storeName}`);
            } else {
              logger.warn(`⚠️ Loja ${loja?.storeName} não possui ambos os métodos de envio (sedex e apac).`);
            }
          }
        }
      }

      return response
        .filter(item => item && item.value)
        .sort((a, b) => a.rawDistance - b.rawDistance)
        .map(({ rawDistance, ...rest }) => rest);

    } catch (error) {
      logger.error(`❌ Erro na busca por lojas com base no CEP ${cep}: ${error.message}`);
      throw error;
    }
  }

  async getStoreById(id: string) {
    if (!isValidObjectId(id)) {
      logger.warn(`⚠️ ID de loja inválido: ${id}`);
      throw new BadRequestException('O ID fornecido não é válido.');
    }

    const store = await this.storeModel.findById(id);

    if (!store) {
      logger.warn(`⚠️ Loja não encontrada para o ID: ${id}`);
      throw new NotFoundException('Loja não encontrada.');
    }

    logger.info(`✅ Loja encontrada: ${store.storeName}`);
    return store;
  }

  async getStoresByState(state: string) {
    const normalizedState = state.toUpperCase();
    if (normalizedState.length !== 2) {
      logger.warn(`⚠️ Código de estado inválido: ${state}`);
      throw new BadRequestException(
        'Código do estado inválido. Use exatamente 2 letras (ex: PE, RJ, SP).',
      );
    }

    const stores = await this.storeModel.find({ state: normalizedState });

    if (!stores || stores.length === 0) {
      logger.warn(`⚠️ Nenhuma loja encontrada para o estado: ${normalizedState}`);
      throw new NotFoundException(
        `Nenhuma loja encontrada para o estado ${normalizedState}.`,
      );
    }

    logger.info(`✅ ${stores.length} lojas encontradas para o estado ${normalizedState}`);
    return stores;
  }
}

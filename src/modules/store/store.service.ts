import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from '../store/interfaces/store.interface';
import { MapsService } from '../shipping/maps.service';
import { MelhorEnvioService } from '../shipping/melhorenvio.service';
import { ViaCepService } from '../cep/viacep.service';

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
    const location = await this.viaCep.getCoordinatesFromCep(cep);
    console.log('Location:', location);
    const pdvs = await this.storeModel.find({ type: 'PDV' });

    const response: any[] = [];

    for (const pdv of pdvs) {
      const distance = await this.mapsService.getDistanceBetween(
        { latitude: pdv.latitude, longitude: pdv.longitude },
        { latitude: location.latitude, longitude: location.longitude },
      );
      console.log(`Distância para ${pdv.storeName}: ${distance.distanceInKm} km`);

      const isWithin50km = distance.distanceInKm <= 50;

      if (isWithin50km) {
        const deliveryTime = await this.melhorEnvio.getDeliveryTime(
          pdv.storeID,
          { ...location, postalCode: cep },
          true,
          { postalCode: pdv.postalCode },
        );

        response.push({
          storeID: pdv.storeID,
          storeName: pdv.storeName,
          address: pdv.address,
          city: pdv.city,
          district: pdv.district,
          state: pdv.state,
          country: pdv.country,
          postalCode: pdv.postalCode,
          telephoneNumber: pdv.telephoneNumber,
          emailAddress: pdv.emailAddress,
          latitude: pdv.latitude,
          longitude: pdv.longitude,
          type: pdv.type,
          shippingPrice: 15,
          deliveryTime,
        });
      } else {
        const loja = await this.storeModel.findOne({
          storeID: pdv.storeID,
          type: 'loja',
        });

        if (loja) {
          const shippingMethods = await this.melhorEnvio.getFreteFromLoja(
            loja,
            { ...location, postalCode: cep },
          );

          response.push({
            storeID: loja.storeID,
            storeName: loja.storeName,
            address: loja.address,
            city: loja.city,
            district: loja.district,
            state: loja.state,
            country: loja.country,
            postalCode: loja.postalCode,
            telephoneNumber: loja.telephoneNumber,
            emailAddress: loja.emailAddress,
            latitude: loja.latitude,
            longitude: loja.longitude,
            type: loja.type,
            shippingMethods,
          });
        }
      }
    }

    return response;
  }

  async getStoreById(id: string) {
    return this.storeModel.findById(id);
  }

  async getStoresByState(state: string) {
    return this.storeModel.find({ state });
  }
}

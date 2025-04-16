import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { logger } from '../../utils/logger';

@Injectable()
export class MelhorEnvioService {
  private readonly apiKey = process.env.MELHOR_ENVIO_API_KEY;

  async getDeliveryTime(
    storeID: string,
    location: any,
    isWithin50km: boolean,
    pdv: { postalCode: string }
  ): Promise<string> {
    const url = `https://melhorenvio.com.br/api/v2/me/shipment/calculate`;

    const body = {
      from: { postal_code: pdv.postalCode },
      to: { postal_code: location.postalCode },
      products: [
        {
          id: "1",
          width: 15,
          height: 10,
          length: 20,
          weight: 1,
          insurance_value: 0,
          quantity: 1,
        },
      ],
      options: {
        receipt: false,
        own_hand: false,
        insurance_value: 0,
        reverse: false,
        non_commercial: true,
      },
      services: ["2"],
    };

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      logger.info(`📦 Calculando prazo de entrega via SEDEX para StoreID: ${storeID}`);
      const response = await axios.post(url, body, { headers });

      const deliveryTime = response.data[1]?.delivery_time ?? 'Indisponível';
      logger.info(`✅ Prazo de entrega obtido: ${deliveryTime}`);

      return deliveryTime;
    } catch (error) {
      logger.error(`❌ Erro ao calcular prazo de entrega (StoreID: ${storeID}): ${error.message}`);
      throw new InternalServerErrorException('Erro ao obter prazo de entrega com Melhor Envio');
    }
  }

  async getFreteFromLoja(from: { postalCode: string }, to: { postalCode: string }) {
    const url = `https://melhorenvio.com.br/api/v2/me/shipment/calculate`;

    const body = {
      from: { postal_code: from.postalCode },
      to: { postal_code: to.postalCode },
      products: [
        {
          id: "1",
          width: 15,
          height: 10,
          length: 20,
          weight: 1,
          insurance_value: 0,
          quantity: 1,
        },
      ],
      options: {
        receipt: false,
        own_hand: false,
        insurance_value: 0,
        reverse: false,
        non_commercial: true,
      },
      services: ["1", "2"],
    };

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      logger.info(`📦 Calculando frete APAC e SEDEX de ${from.postalCode} para ${to.postalCode}`);
      const response = await axios.post(url, body, { headers });

      const apac = {
        price: response.data[0]?.price,
        deliveryTime: response.data[0]?.delivery_time,
      };

      const sedex = {
        price: response.data[1]?.price,
        deliveryTime: response.data[1]?.delivery_time,
      };

      logger.info(`✅ Fretes obtidos - APAC: R$${apac.price}, SEDEX: R$${sedex.price}`);
      return { apac, sedex };
    } catch (error) {
      logger.error(`❌ Erro ao calcular frete com Melhor Envio: ${error.message}`);
      throw new InternalServerErrorException('Erro ao obter frete com Melhor Envio');
    }
  }
}

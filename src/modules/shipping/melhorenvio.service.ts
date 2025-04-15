import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MelhorEnvioService {
  private readonly apiKey = process.env.MELHOR_ENVIO_API_KEY;

  async getDeliveryTime(storeID: string, location: any, isWithin50km: boolean, pdv: { postalCode: string }): Promise<string> {

    const url = `https://melhorenvio.com.br/api/v2/me/shipment/calculate`;

    const body = {
      from: {
        postal_code: pdv.postalCode,
      },
      to: {
        postal_code: location.postalCode,
      },
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
      'Accept': 'application/json',
    };

    const response = await axios.post(url, body, { headers });

    return response.data[1]?.delivery_time ?? 'Indisponível';
  }

  async getFreteFromLoja(from: { postalCode: string } | any, to: { postalCode: string }) {
    const url = `https://melhorenvio.com.br/api/v2/me/shipment/calculate`;
  
    const baseBody = {
      from: {
        postal_code: from.postalCode,
      },
      to: {
        postal_code: to.postalCode,
      },
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
      services: ["1,2"],
    };
  
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const response = await axios.post(url, baseBody, { headers });
  
    const apac = {
      price: response.data[0]?.price,
      deliveryTime: response.data[0]?.delivery_time,
    };
    
    const sedex = {
      price: response.data[1]?.price,
      deliveryTime: response.data[1]?.delivery_time,
    };
    
    console.log('APAC:', apac);
    console.log('SEDEX:', sedex);
    
    return { apac, sedex };    
    
  }
  
}

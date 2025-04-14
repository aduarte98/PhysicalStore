import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MelhorEnvioService {
  private readonly apiKey = process.env.MELHOR_ENVIO_API_KEY;

  // Função para obter o tempo de entrega de um PDV dentro de 50 km
  async getDeliveryTime(storeID: string, location: any, isWithin50km: boolean, pdv: { postalCode: string }): Promise<string> {
    if (!isWithin50km) {
      return 'Não disponível para mais de 50 km';
    }

    const url = `https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate`; // URL corrigida

    const body = [
      {
        from: {
          postal_code: pdv.postalCode, // CEP da loja fornecido como parâmetro
        },
        to: {
          postal_code: location.postalCode,
        },
        services: '1', // "1" = SEDEX
      }
    ];

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json', // Cabeçalho para enviar como JSON
      'Accept': 'application/json',
    };

    const response = await axios.post(url, body, { headers });

    // Retornando o tempo de entrega ou mensagem de erro
    return response.data[0]?.delivery_time ?? 'Indisponível';
  }

  // Função para obter o preço e tempo de entrega usando SEDEX e PAC
  async getFreteFromLoja(from: { postalCode: string }, to: { postalCode: string }) {
    const url = `https://api.melhorenvio.com.br/api/v2/me/shipment/calculate`; // URL corrigida

    const body = [
      {
        from: { postal_code: from.postalCode },
        to: { postal_code: to.postalCode },
        services: "1,2", // "1" = SEDEX, "2" = PAC
      },
    ];

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json', // Cabeçalho para enviar como JSON
      'Accept': 'application/json',
    };

    // Enviando as requisições para SEDEX e PAC em paralelo
    const [apacRes, sedexRes] = await Promise.all([
      axios.post(url, { ...body[0], services: ['2'] }, { headers }), // PAC
      axios.post(url, { ...body[0], services: ['1'] }, { headers }), // SEDEX
    ]);

    // Retornando os valores de frete e prazo de entrega
    return {
      apac: {
        price: apacRes.data[0]?.price,
        deliveryTime: apacRes.data[0]?.delivery_time,
      },
      sedex: {
        price: sedexRes.data[0]?.price,
        deliveryTime: sedexRes.data[0]?.delivery_time,
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ViaCepService {
  private readonly apiUrl = 'https://viacep.com.br/ws/';
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  async getCoordinatesFromCep(cep: string): Promise<{ latitude: number; longitude: number }> {
    const sanitizedCep = cep.replace(/\D/g, '');
    if (sanitizedCep.length !== 8) {
      throw new Error('CEP inválido. Certifique-se de que contém 8 dígitos numéricos.');
    }

    // Consulta ao ViaCEP para pegar o endereço
    const url = `${this.apiUrl}${sanitizedCep}/json/`;
    const { data } = await axios.get(url);

    if (data.erro) {
      throw new Error('CEP inválido.');
    }

    // Monta o endereço completo
    const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, Brasil`;

    // Faz geocodificação usando Nominatim (OpenStreetMap)
    const response = await axios.get(this.nominatimUrl, {
      params: {
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
      headers: {
        'User-Agent': 'MinhaAplicacao (seu-email@dominio.com)', // Nominatim exige esse cabeçalho
      },
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Não foi possível obter as coordenadas para o CEP.');
    }

    const { lat, lon } = response.data[0];

    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  }
}

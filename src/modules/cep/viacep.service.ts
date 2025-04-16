import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { logger } from '../../utils/logger';

@Injectable()
export class ViaCepService {
  private readonly apiUrl = 'https://viacep.com.br/ws/';
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  async getCoordinatesFromCep(cep: string): Promise<{ latitude: number; longitude: number }> {
    try {
      logger.info(`📍 Buscando coordenadas para o CEP: ${cep}`);
      
      const sanitizedCep = cep.replace(/\D/g, '');
      if (sanitizedCep.length !== 8) {
        logger.warn(`❌ CEP inválido fornecido: ${cep}`);
        throw new Error('CEP inválido. Certifique-se de que contém 8 dígitos numéricos.');
      }

      const { data } = await axios.get(`${this.apiUrl}${sanitizedCep}/json/`);

      if (data.erro) {
        logger.warn(`❌ ViaCEP retornou erro para o CEP ${sanitizedCep}`);
        throw new Error('CEP inválido.');
      }

      const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, Brasil`;

      const response = await axios.get(this.nominatimUrl, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
        headers: {
          'User-Agent': 'MinhaAplicacao (seu-email@dominio.com)',
        },
      });

      if (!response.data || response.data.length === 0) {
        logger.error(`❌ Nominatim não retornou coordenadas para o CEP ${cep}`);
        throw new Error('Não foi possível obter as coordenadas para o CEP.');
      }

      const { lat, lon } = response.data[0];
      logger.info(`✅ Coordenadas encontradas para o CEP ${cep}`);

      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    } catch (error) {
      logger.error(`🔥 Erro ao buscar coordenadas para o CEP ${cep}: ${error.message}`);
    }
  }
}

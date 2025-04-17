import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { logger } from '../../utils/logger';

@Injectable()
export class ViaCepService {
  private readonly apiUrl = 'https://viacep.com.br/ws/';
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  async getCoordinatesFromCep(cep: string): Promise<{ latitude: number; longitude: number }> {
    const sanitizedCep = cep.replace(/\D/g, '');

    if (sanitizedCep.length !== 8) {
      logger.warn(`❌ CEP em formato inválido: ${cep}`);
      throw new BadRequestException('CEP inválido. Formato esperado: 8 dígitos numéricos.');
    }

    try {
      logger.info(`📍 Buscando endereço no ViaCEP para o CEP: ${sanitizedCep}`);
      const { data } = await axios.get(`${this.apiUrl}${sanitizedCep}/json/`);

      if (!data || data.erro) {
        logger.warn(`❌ ViaCEP retornou erro para o CEP ${sanitizedCep}`);
        throw new NotFoundException(`CEP ${sanitizedCep} não encontrado.`);
      }

      const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, Brasil`;

      logger.info(`📍 Buscando coordenadas no Nominatim para o endereço: ${address}`);
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
        throw new NotFoundException('Não foi possível obter as coordenadas para o CEP informado.');
      }

      const { lat, lon } = response.data[0];
      logger.info(`✅ Coordenadas encontradas para o CEP ${cep}`);

      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      logger.error(`🔥 Erro ao buscar coordenadas para o CEP ${cep}: ${error.message}`);
      throw new InternalServerErrorException('Erro ao buscar coordenadas para o CEP.');
    }
  }
}

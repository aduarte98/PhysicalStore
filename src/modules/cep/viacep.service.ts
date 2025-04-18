import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { logger } from '../../utils/logger';

@Injectable()
export class ViaCepService {
  private readonly apiUrl = 'https://viacep.com.br/ws/';

  async getAddressFromCep(cep: string): Promise<string> {
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

      const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
      logger.info(`✅ Endereço encontrado para o CEP ${cep}: ${fullAddress}`);

      return data;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      logger.error(`🔥 Erro ao buscar endereço para o CEP ${cep}: ${error.message}`);
      throw new InternalServerErrorException('Erro ao buscar endereço para o CEP.');
    }
  }
}

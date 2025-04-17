import { Test, TestingModule } from '@nestjs/testing';
import { ViaCepService } from '../src/modules/cep/viacep.service';
import axios from 'axios';
import { logger } from '../src/utils/logger';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ViaCepService', () => {
  let service: ViaCepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ViaCepService],
    }).compile();

    service = module.get<ViaCepService>(ViaCepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar as coordenadas de um CEP válido', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          logradouro: 'Rua do Sol',
          bairro: 'Boa Vista',
          localidade: 'Recife',
          uf: 'PE',
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            lat: '-8.047562',
            lon: '-34.877003',
          },
        ],
      });

    const result = await service.getCoordinatesFromCep('50050-010');
    logger.info('Resultado da localização ViaCEP', result);
    expect(result).toEqual({ latitude: -8.047562, longitude: -34.877003 });
  });

  it('deve lançar erro para CEP inválido ou resposta inesperada', async () => {
    mockedAxios.get.mockResolvedValue({ data: { erro: true } });
  
    await expect(service.getCoordinatesFromCep('00000-000')).rejects.toThrow(
      'CEP 00000000 não encontrado.',
    );
  });
  
  it('deve lançar erro para falha na API do ViaCEP', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Erro ao chamar a API do ViaCEP'));
  
    await expect(service.getCoordinatesFromCep('00000-000')).rejects.toThrow(
      'Erro ao buscar coordenadas para o CEP.',
    );
  });  
});

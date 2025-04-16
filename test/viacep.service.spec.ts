import { Test, TestingModule } from '@nestjs/testing';
import { ViaCepService } from '../src/modules/cep/viacep.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { logger } from '../src/utils/logger';

describe('ViaCepService', () => {
  let service: ViaCepService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViaCepService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ViaCepService>(ViaCepService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('deve retornar as coordenadas de um CEP válido', async () => {
    jest.spyOn(httpService, 'get')
      .mockImplementationOnce(() =>
        of({
          data: {
            localidade: 'Recife',
            uf: 'PE',
          },
          status: 200,
        } as AxiosResponse)
      )
      .mockImplementationOnce(() =>
        of({
          data: {
            lat: '-8.047562',
            lon: '-34.877003',
          },
          status: 200,
        } as AxiosResponse)
      );

    const result = await service.getCoordinatesFromCep('50050-010');
    logger.info('Resultado da localização ViaCEP', result);
    expect(result).toEqual({ latitude: -8.047562, longitude: -34.877003 });
  });

  it('deve lançar erro para CEP inválido ou resposta inesperada', async () => {
    jest.spyOn(httpService, 'get').mockReturnValue(
      of({
        data: {}, // Resposta inesperada
        status: 200,
      } as AxiosResponse)
    );

    await expect(service.getCoordinatesFromCep('00000-000')).rejects.toThrow('Erro ao buscar coordenadas para o CEP.');
  });

  it('deve lançar erro para falha na API do ViaCEP', async () => {
    jest.spyOn(httpService, 'get').mockReturnValue(
      throwError(() => new Error('Erro ao chamar a API do ViaCEP'))
    );

    await expect(service.getCoordinatesFromCep('00000-000')).rejects.toThrow('Erro ao buscar coordenadas para o CEP.');
  });
});
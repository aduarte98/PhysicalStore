import { Test, TestingModule } from '@nestjs/testing';
import { ViaCepService } from '../src/modules/cep/viacep.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
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
    const mockResponse = {
      data: {
        results: [{
          geometry: {
            location: {
              lat: -8.047562,
              lng: -34.877003,
            },
          },
        }],
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

    const result = await service.getCoordinatesFromCep('50050-010');
    logger.info('Resultado da localização ViaCEP', result);
    expect(result).toEqual({ latitude: -8.047562, longitude: -34.877003 });
  });

  it('deve lançar erro para CEP inválido', async () => {
    const mockError = { data: { results: [] } };
    jest.spyOn(httpService, 'get').mockReturnValue(of(mockError as any));

    await expect(service.getCoordinatesFromCep('00000-000')).rejects.toThrow();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MapsService } from '../src/modules/shipping/maps.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { logger } from '../src/utils/logger';

describe('RouterProjectService', () => {
  let service: MapsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MapsService>(MapsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('deve retornar a distância e tempo entre dois pontos', async () => {
    const origem = { latitude: -8.0476, longitude: -34.877 };
    const destino = { latitude: -8.052, longitude: -34.9 };

    const mockResponse = {
      data: {
        code: 'Ok',
        routes: [
          {
            distance: 10000, // metros
            duration: 900,   // segundos
          },
        ],
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

    const result = await service.getDistanceBetween(origem, destino);
    logger.info('Resultado do router.project:', result);

    expect(result).toEqual({
      origin: '-8.0476,-34.877',
      destination: '-8.052,-34.9',
      distanceInKm: 10,
      latitude: -8.0476,
      longitude: -34.877,
    });
  });

  it('deve lançar erro se API de rota falhar', async () => {
    const origem = { latitude: -8.0476, longitude: -34.877 };
    const destino = { latitude: -8.052, longitude: -34.9 };

    jest.spyOn(httpService, 'get').mockReturnValue(
      throwError(() => new Error('Erro ao obter rota'))
    );

    await expect(service.getDistanceBetween(origem, destino)).rejects.toThrow('Erro ao obter distância');
    logger.error('Erro simulado na chamada ao router.project');
  });
});

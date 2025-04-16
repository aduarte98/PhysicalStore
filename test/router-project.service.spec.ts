import { Test, TestingModule } from '@nestjs/testing';
import { RouterProjectService } from '../src/modules/shipping/maps.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { logger } from '../src/utils/logger';

describe('RouterProjectService', () => {
  let service: RouterProjectService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouterProjectService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RouterProjectService>(RouterProjectService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('deve retornar a distância e tempo entre dois pontos', async () => {
    const origem = { latitude: -8.0476, longitude: -34.877 };
    const destino = { latitude: -8.052, longitude: -34.9 };

    const mockResponse = {
      data: {
        routes: [
          {
            distance: 10000, // em metros
            duration: 900, // em segundos
          },
        ],
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

    const result = await service.getDistanceBetween(origem, destino);
    logger.info('Resultado do router.project:', result);

    expect(result).toEqual({
      distanceInKm: 10,
      durationInMin: 15,
    });
  });

  it('deve lançar erro se API de rota falhar', async () => {
    const origem = { latitude: -8.0476, longitude: -34.877 };
    const destino = { latitude: -8.052, longitude: -34.9 };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(() => new Error('Erro ao obter rota')));

    await expect(service.getDistanceBetween(origem, destino)).rejects.toThrow('Erro ao obter rota');
    logger.error('Erro simulado na chamada ao router.project');
  });
});

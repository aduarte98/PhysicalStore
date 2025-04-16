import { Test, TestingModule } from '@nestjs/testing';
import { MelhorEnvioService } from '../src/modules/shipping/melhorenvio.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { logger } from '../src/utils/logger';

describe('MelhorEnvioService', () => {
  let service: MelhorEnvioService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MelhorEnvioService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MelhorEnvioService>(MelhorEnvioService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('deve retornar tempo de entrega para uma loja próxima', async () => {
    const mockResponse = {
      data: [{ delivery_time: { days: 2 } }],
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as any));

    const delivery = await service.getDeliveryTime(
      'PDV001',
      { latitude: -8.05, longitude: -34.9, postalCode: '50000-000' },
      { postalCode: '50000-000' },
      45
    );
    

    logger.info('Tempo de entrega estimado: ' + delivery + ' dias');
    expect(delivery).toBe(2);
  });

  it('deve capturar erro do serviço do Melhor Envio', async () => {
    jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => new Error('Erro no Melhor Envio')));

    await expect(
      service.getDeliveryTime('PDV001', {
        latitude: -8.0,
        longitude: -34.8,
        postalCode: '57051-090',
      }, true)
    ).rejects.toThrow('Erro no Melhor Envio');
  });
});

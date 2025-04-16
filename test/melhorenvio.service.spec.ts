import { Test, TestingModule } from '@nestjs/testing';
import { MelhorEnvioService } from '../src/modules/shipping/melhorenvio.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

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
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as AxiosResponse));

    const delivery = await service.getDeliveryTime(
      'PDV001',
      { latitude: -8.05, longitude: -34.9, postalCode: '50000-000' },
      true, // simula entrega
      { postalCode: '50000-000' } // argumento pdv
    );

    expect(delivery).toBe(2); // Verifica se o tempo de entrega é 2 dias
  });

  it('deve capturar erro do serviço do Melhor Envio', async () => {
    jest.spyOn(httpService, 'post').mockReturnValue(
      throwError(() => new Error('Erro no Melhor Envio'))
    );

    await expect(
      service.getDeliveryTime(
        'PDV001',
        {
          latitude: -8.0,
          longitude: -34.8,
          postalCode: '57051-090',
        },
        true,
        { postalCode: '57051-090' }
      )
    ).rejects.toThrow('Erro no Melhor Envio'); // Verifica se o erro é capturado corretamente
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { MelhorEnvioService } from '../src/modules/shipping/melhorenvio.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MelhorEnvioService', () => {
  let service: MelhorEnvioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MelhorEnvioService],
    }).compile();

    service = module.get<MelhorEnvioService>(MelhorEnvioService);
  });

  it('deve retornar tempo de entrega para uma loja próxima', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: [
        { delivery_time: '1 dia' },
        { delivery_time: '2 dias' }, // SEDEX
      ],
    });

    const delivery = await service.getDeliveryTime(
      'PDV001',
      { latitude: -8.05, longitude: -34.9, postalCode: '50000-000' },
      true,
      { postalCode: '50000-000' }
    );

    expect(delivery).toBe('2 dias');
  });

  it('deve capturar erro do serviço do Melhor Envio', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Erro no Melhor Envio'));

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
    ).rejects.toThrow('Erro no Melhor Envio');
  });
});

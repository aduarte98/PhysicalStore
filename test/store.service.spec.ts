import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from '../src/modules/store/store.service';
import { getModelToken } from '@nestjs/mongoose';
import { MapsService } from '../src/modules/shipping/maps.service';
import { MelhorEnvioService } from '../src/modules/shipping/melhorenvio.service';
import { ViaCepService } from '../src/modules/cep/viacep.service';
import { logger } from '../src/utils/logger';

describe('StoreService', () => {
  let service: StoreService;

  const mockStoreModel = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMapsService = {
    getDistanceBetween: jest.fn(),
  };

  const mockMelhorEnvio = {
    getDeliveryTime: jest.fn(),
    getFreteFromLoja: jest.fn(),
  };

  const mockViaCep = {
    getCoordinatesFromCep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getModelToken('Store'), useValue: mockStoreModel },
        { provide: MapsService, useValue: mockMapsService },
        { provide: MelhorEnvioService, useValue: mockMelhorEnvio },
        { provide: ViaCepService, useValue: mockViaCep },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar loja com frete fixo para PDV a menos de 50km', async () => {
    mockViaCep.getCoordinatesFromCep.mockResolvedValue({
      latitude: -8.0,
      longitude: -34.9,
      postalCode: '50050-010'
    });

    mockStoreModel.find.mockResolvedValue([
      {
        storeID: 'PDV001',
        latitude: -8.1,
        longitude: -34.8,
        type: 'PDV',
        address: { postalCode: '50000-000' }
      }
    ]);

    mockMapsService.getDistanceBetween.mockResolvedValue({ distanceInKm: 10 });
    mockMelhorEnvio.getDeliveryTime.mockResolvedValue(2);

    const response = await service.findByCep('50050-010');
    logger.info('Resultado com PDV próximo: ', response);

    expect(response).toBeDefined();
    expect(response[0]?.shippingPrice).toBe(15);
    expect(response[0]?.deliveryTime).toBe(2);
  });

  it('deve retornar loja com frete do Melhor Envio para PDV distante', async () => {
    mockViaCep.getCoordinatesFromCep.mockResolvedValue({
      latitude: -8.0,
      longitude: -34.9,
      postalCode: '50050-010'
    });

    mockStoreModel.find.mockResolvedValue([
      {
        storeID: 'PDV001',
        latitude: -9.0,
        longitude: -35.9,
        type: 'PDV',
        address: { postalCode: '60000-000' }
      }
    ]);

    mockMapsService.getDistanceBetween.mockResolvedValue({ distanceInKm: 100 });

    mockStoreModel.findOne.mockResolvedValue({
      storeID: 'LOJA001',
      type: 'loja',
    });

    mockMelhorEnvio.getFreteFromLoja.mockResolvedValue([
      { name: 'PAC', price: 20, prazo_entrega: 5 }
    ]);

    const response = await service.findByCep('50050-010');
    logger.info('Resultado com loja online por PDV distante: ', response);

    expect(response).toBeDefined();
    expect(response[0]?.shippingMethods?.[0]?.name).toBe('PAC');
    expect(response[0]?.shippingMethods?.[0]?.price).toBe(20);
  });
});

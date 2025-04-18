import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from '../src/modules/store/store.service';
import { getModelToken } from '@nestjs/mongoose';
import { MapsService } from '../src/modules/shipping/maps.service';
import { MelhorEnvioService } from '../src/modules/shipping/melhorenvio.service';
import { ViaCepService } from '../src/modules/cep/viacep.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockStoreModel = () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
});

const mockMapsService = () => ({
  getDistanceBetween: jest.fn().mockImplementation(() => Promise.resolve({ distanceInKm: 10 })),
});

const mockMelhorEnvioService = () => ({
  getDeliveryTime: jest.fn().mockResolvedValue('2 dias úteis'),
  getFreteFromLoja: jest.fn().mockImplementation(() => 
    Promise.resolve({
      sedex: { price: 23.5, deliveryTime: 2 },
      apac: { price: 19.9, deliveryTime: 4 },
    })
  ),
});

const mockViaCepService = () => ({
  getAddressFromCep: jest.fn().mockResolvedValue(''),
});

describe('StoreService', () => {
  let service: StoreService;
  let storeModel: any;
  let mapsService: MapsService;
  let melhorEnvio: MelhorEnvioService;
  let viaCep: ViaCepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getModelToken('Store'), useFactory: mockStoreModel },
        { provide: MapsService, useFactory: mockMapsService },
        { provide: MelhorEnvioService, useFactory: mockMelhorEnvioService },
        { provide: ViaCepService, useFactory: mockViaCepService },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    storeModel = module.get(getModelToken('Store'));
    mapsService = module.get<MapsService>(MapsService);
    melhorEnvio = module.get<MelhorEnvioService>(MelhorEnvioService);
    viaCep = module.get<ViaCepService>(ViaCepService);
  });

  it('getAllStores - deve retornar todas as lojas', async () => {
    const stores = [{ storeName: 'Loja A' }, { storeName: 'Loja B' }];
    storeModel.find.mockResolvedValue(stores);

    const result = await service.getAllStores();
    expect(result).toEqual(stores);
  });

  it('getStoreById - deve retornar a loja se o ID for válido', async () => {
    const mockStore = { _id: '123', storeName: 'Loja Teste' };
    storeModel.findById.mockResolvedValue(mockStore);

    const result = await service.getStoreById('507f1f77bcf86cd799439011');
    expect(result).toEqual(mockStore);
  });

  it('getStoreById - deve lançar erro se o ID for inválido', async () => {
    await expect(service.getStoreById('invalido')).rejects.toThrow(BadRequestException);
  });

  it('getStoreById - deve lançar erro se loja não for encontrada', async () => {
    storeModel.findById.mockResolvedValue(null);
    await expect(service.getStoreById('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
  });

  it('getStoresByState - deve retornar lojas pelo estado', async () => {
    storeModel.find.mockResolvedValue([{ state: 'PE' }]);
    const result = await service.getStoresByState('pe');
    expect(result).toEqual([{ state: 'PE' }]);
  });

  it('getStoresByState - deve lançar erro para estado inválido', async () => {
    await expect(service.getStoresByState('pernambuco')).rejects.toThrow(BadRequestException);
  });

  it('getStoresByState - deve lançar erro se nenhuma loja for encontrada', async () => {
    storeModel.find.mockResolvedValue([]);
    await expect(service.getStoresByState('SP')).rejects.toThrow(NotFoundException);
  });

  it('findByCep - deve retornar loja PDV se estiver dentro de 50km', async () => {
    const cep = '50710-000';
    const enderecoViaCep = {
      logradouro: 'Rua Exemplo',
      bairro: 'Boa Viagem',
      localidade: 'Recife',
      uf: 'PE',
    };

    const pdv = {
      storeID: 'PDV001',
      storeName: 'PDV Recife',
      type: 'PDV',
      address: 'Rua PDV',
      city: 'Recife',
      state: 'PE',
      postalCode: '50710000',
    };

    (viaCep.getAddressFromCep as jest.Mock).mockResolvedValue(enderecoViaCep);
    storeModel.find.mockResolvedValue([pdv]);
    // Mocked in the mockMapsService factory
    (melhorEnvio.getDeliveryTime as jest.Mock).mockResolvedValue('2 dias úteis');

    const result = await service.findByCep(cep);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('PDV');
    expect(result[0].value[0].price).toBe('R$ 15,00');
  });

  it('findByCep - deve retornar loja online com PAC e Sedex se estiver além de 50km', async () => {
    const cep = '50710-000';
    const enderecoViaCep = {
      logradouro: 'Rua Exemplo',
      bairro: 'Boa Viagem',
      localidade: 'Recife',
      uf: 'PE',
    };

    const pdv = {
      storeID: 'PDV002',
      storeName: 'PDV São Paulo',
      type: 'PDV',
      address: 'Rua Longe',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01010000',
    };

    const loja = {
      storeID: 'LOJA002',
      storeName: 'Loja Online',
      type: 'loja',
      postalCode: '01010000',
      city: 'São Paulo',
    };

    (viaCep.getAddressFromCep as jest.Mock).mockResolvedValue(enderecoViaCep);
    storeModel.find.mockResolvedValue([pdv]);
    (mapsService.getDistanceBetween as jest.Mock).mockResolvedValue({ distanceInKm: 120 });
    storeModel.findOne.mockResolvedValueOnce(loja); // busca a loja associada
    storeModel.findOne.mockResolvedValueOnce(pdv); // busca o PDV associado da loja
    (melhorEnvio.getFreteFromLoja as jest.Mock).mockResolvedValue({
      sedex: { price: 23.5, deliveryTime: 2 },
      apac: { price: 19.9, deliveryTime: 4 },
    });

    const result = await service.findByCep(cep);

    expect(result[0].type).toBe('LOJA');
    expect(result[0].value).toHaveLength(2);
    expect(result[0].value[0].description).toContain('Sedex');
  });

  it('findByCep - deve lançar erro se ViaCEP retornar inválido', async () => {
    (viaCep.getAddressFromCep as jest.Mock).mockResolvedValue(null);
    await expect(service.findByCep('50710-000')).rejects.toThrow(BadRequestException);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ViaCepService } from '../src/modules/cep/viacep.service';
import axios from 'axios';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

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

  it('deve retornar o endereço formatado para um CEP válido', async () => {
    const mockCep = '50710-000';
    const mockResponse = {
      logradouro: 'Rua do Sol',
      bairro: 'Boa Vista',
      localidade: 'Recife',
      uf: 'PE'
    };
  
    service.getAddressFromCep = jest.fn().mockResolvedValue(mockResponse);
  
    const result = await service.getAddressFromCep(mockCep);
  
    expect(result).toEqual(mockResponse);
  });
  

  it('deve lançar BadRequestException para CEP inválido', async () => {
    await expect(service.getAddressFromCep('123')).rejects.toThrow(BadRequestException);
  });

  it('deve lançar NotFoundException quando o CEP não for encontrado', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { erro: true } });

    await expect(service.getAddressFromCep('99999-999')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar InternalServerErrorException em caso de erro desconhecido', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Erro de rede'));

    await expect(service.getAddressFromCep('50050-010')).rejects.toThrow(InternalServerErrorException);
  });
});

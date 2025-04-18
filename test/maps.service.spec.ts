import { Test, TestingModule } from '@nestjs/testing';
import { MapsService } from '../src/modules/shipping/maps.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

describe('MapsService', () => {
  let service: MapsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapsService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MapsService>(MapsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('deve retornar a distância entre dois endereços', async () => {
    const origin = 'Rua A, Bairro X, Recife, PE';
    const destination = 'Rua B, Bairro Y, Olinda, PE';

    const mockResponse: AxiosResponse = {
      data: {
        routes: [
          {
            distanceMeters: 12500,
            duration: 'PT20M',
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new (require('axios').AxiosHeaders)(),
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    const result = await service.getDistanceBetween(origin, destination);

    expect(result).toEqual({
      origin,
      destination,
      distanceInKm: 12.5,
    });
  });

  it('deve lançar erro se rota não for encontrada', async () => {
    const origin = 'Endereço Inválido A';
    const destination = 'Endereço Inválido B';

    const mockResponse: AxiosResponse = {
      data: {
        routes: [],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new (require('axios').AxiosHeaders)(),
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    await expect(service.getDistanceBetween(origin, destination)).rejects.toThrow(
      new Error('Erro ao calcular distância.')
    );
  });

  it('deve lançar erro se API falhar', async () => {
    const origin = 'Rua XPTO, Bairro ABC, Recife, PE';
    const destination = 'Rua DEF, Bairro XYZ, Olinda, PE';

    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(throwError(() => new Error('Falha na API')));

    await expect(service.getDistanceBetween(origin, destination)).rejects.toThrow(
      new InternalServerErrorException('Erro ao calcular distância.')
    );
  });
});

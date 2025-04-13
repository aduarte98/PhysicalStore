import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DistanceResult } from './interfaces/distance.interface';

@Injectable()
export class MapsService {
  constructor(private readonly httpService: HttpService) {}

  async getDistanceBetween(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<DistanceResult> {
    const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;

    const { data } = await firstValueFrom(this.httpService.get(url));

    if (!data || data.code !== 'Ok') {
      throw new Error('Erro ao calcular distância com OSRM');
    }

    const distanceInMeters = data.routes[0].distance;
    const distanceInKm = distanceInMeters / 1000;

    return {
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      distanceInKm,
      latitude: origin.latitude,
      longitude: origin.longitude,
    };
  }
}

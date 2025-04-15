import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DistanceResult } from './interfaces/distance.interface';

@Injectable()
export class MapsService {
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  async getDistanceBetween(origin: string, destination: string): Promise<DistanceResult> {
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const params = {
      origins: origin,
      destinations: destination,
      key: this.apiKey,
    };

    const { data } = await firstValueFrom(this.httpService.get(url, { params }));

    if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
      throw new Error('Erro ao calcular distância pelo Google Maps');
    }

    const distanceInMeters = data.rows[0].elements[0].distance.value;
    const distanceInKm = distanceInMeters / 1000;

    const latitude = data.origin_addresses[0];
    const longitude = data.destination_addresses[0];

    return {
      origin,
      destination,
      distanceInKm,
      latitude,
      longitude,
    };    
  }
}
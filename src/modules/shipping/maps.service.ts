import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DistanceResult } from './interfaces/distance.interface';
import { logger } from '../../utils/logger';

@Injectable()
export class MapsService {
  constructor(private readonly httpService: HttpService) {}

  async getDistanceBetween(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<DistanceResult> {
    const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;

    try {
      logger.info(`📏 Calculando distância entre (${origin.latitude}, ${origin.longitude}) e (${destination.latitude}, ${destination.longitude})`);

      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data || data.code !== 'Ok') {
        logger.error(`❌ Erro ao calcular distância com OSRM: Resposta inválida`);
        throw new Error('Erro ao calcular distância com OSRM');
      }

      const distanceInMeters = data.routes[0].distance;
      const distanceInKm = distanceInMeters / 1000;

      logger.info(`✅ Distância calculada: ${distanceInKm.toFixed(2)} km`);

      return {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        distanceInKm,
        latitude: origin.latitude,
        longitude: origin.longitude,
      };
    } catch (error) {
      logger.error(`🔥 Erro ao obter distância com OSRM: ${error.message}`);
      throw new InternalServerErrorException('Erro ao obter distância. Tente novamente mais tarde.');
    }
  }
}

import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DistanceResult } from './interfaces/distance.interface';
import { logger } from '../../utils/logger';

@Injectable()
export class MapsService {
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  async getDistanceBetween(
    originAddress: string,
    destinationAddress: string
  ): Promise<DistanceResult> {
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    try {
      logger.info(`📏 Calculando distância entre "${originAddress}" e "${destinationAddress}"`);

      const { data } = await firstValueFrom(
        this.httpService.post(
          url,
          {
            origin: {
              address: originAddress
            },
            destination: {
              address: destinationAddress
            },
            travelMode: 'DRIVE'
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters'
            }
          }
        )
      );

      const route = data.routes?.[0];
      if (!route || !route.distanceMeters) {
        logger.error('❌ Erro ao calcular distância: rota não encontrada', data);
        throw new Error('Erro ao calcular distância: rota inválida.');
      }

      const distanceInKm = route.distanceMeters / 1000;
      logger.info(`✅ Distância calculada: ${distanceInKm.toFixed(2)} km`);

      return {
        origin: originAddress,
        destination: destinationAddress,
        distanceInKm
      };
    } catch (error) {
      logger.error(`🔥 Erro ao calcular distância com Google Routes API: ${error.message}`);
      throw new InternalServerErrorException('Erro ao calcular distância.');
    }
  }
}

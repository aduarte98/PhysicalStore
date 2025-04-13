import { Module } from '@nestjs/common';
import { MapsService } from './maps.service';
import { MelhorEnvioService } from './melhorenvio.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
    providers: [MapsService, MelhorEnvioService],
    exports: [MapsService, MelhorEnvioService],
})
export class ShippingModule {}
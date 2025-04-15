import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreSchema } from './schemas/store.schema';
import { MapsService } from '../shipping/maps.service';
import { MelhorEnvioService } from '../shipping/melhorenvio.service';
import { ViaCepService } from '../cep/viacep.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Store', schema: StoreSchema }]),
    HttpModule,
  ],
  providers: [
    StoreService,
    MapsService,
    MelhorEnvioService,
    ViaCepService,
  ],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}

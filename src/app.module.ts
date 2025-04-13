import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { mongooseConfig } from './config/database.config';
import { StoreModule } from './modules/store/store.module';
import { CepModule } from './modules/cep/cep.module';
import { ShippingModule } from './modules/shipping/shipping.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => mongooseConfig,
    }),
    StoreModule,
    CepModule,
    ShippingModule,
  ],
  
})
export class AppModule {}

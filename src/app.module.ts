import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from './config/database.config';
import { StoreModule } from './modules/store/store.module';
import { CepModule } from './modules/cep/cep.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { logger } from './utils/logger';
import * as mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        logger.info('🔌 Tentando conectar ao MongoDB...');
        return mongooseConfig;
      },
    }),
    StoreModule,
    CepModule,
    ShippingModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    mongoose.connection.on('connected', () => {
      logger.info('✅ Conectado ao MongoDB com sucesso!');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ Erro na conexão com MongoDB: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Conexão com MongoDB foi perdida.');
    });
  }
}

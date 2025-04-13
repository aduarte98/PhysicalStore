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
    StoreService, // Serviço responsável pela lógica de negócios da loja
    MapsService, // Serviço para obter distância entre coordenadas
    MelhorEnvioService, // Serviço para calcular frete e prazo de entrega
    ViaCepService, // Serviço para obter coordenadas a partir do CEP
  ],
  controllers: [StoreController], // Controlador responsável pelas rotas
  exports: [StoreService], // Exportando o serviço caso seja necessário em outros módulos
})
export class StoreModule {}

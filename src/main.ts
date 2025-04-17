import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { logger } from './utils/logger';


async function bootstrap() {
  try {
    dotenv.config();

    const app = await NestFactory.create(AppModule);

    logger.info('🚀 Servidor iniciado');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('API - Physical Store')
      .setDescription('Documentação da API de frete e lojas')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    logger.info(`✅ Aplicação escutando na porta ${PORT}`);
  } catch (error) {
    logger.error('❌ Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

bootstrap();

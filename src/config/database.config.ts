import { MongooseModuleOptions } from "@nestjs/mongoose";
import * as dotenv from "dotenv";
import { logger } from '../utils/logger';

dotenv.config();

if (!process.env.MONGODB_URI) {
  logger.error('❌ Variável de ambiente MONGODB_URI não definida!');
  throw new Error('MONGODB_URI não definida');
}

logger.info('🛢️ Conectando com o banco de dados MongoDB...');

export const mongooseConfig: MongooseModuleOptions = {
  uri: process.env.MONGODB_URI,
};

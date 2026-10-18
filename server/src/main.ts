import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import { existsSync, mkdirSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/http-exception.filter';

function lanAddresses() {
  try {
    return Object.values(networkInterfaces())
      .flat()
      .filter((i) => i && i.family === 'IPv4' && !i.internal)
      .map((i) => i.address);
  } catch {
    return [];
  }
}

async function bootstrap() {
  const uploadDir = join(process.cwd(), 'uploads');
  mkdirSync(join(uploadDir, 'photos'), { recursive: true });
  mkdirSync(join(uploadDir, 'music'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.use(json({ limit: '2mb' }));
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useStaticAssets(uploadDir, { prefix: '/uploads/', maxAge: '7d' });

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`API BloomNote đang chạy tại http://localhost:${port}`);
  for (const ip of lanAddresses()) console.log(`   LAN: http://${ip}:${port}`);
}

if (existsSync(join(process.cwd(), '.env')) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(join(process.cwd(), '.env'));
}

bootstrap();

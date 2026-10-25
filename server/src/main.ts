import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { seedAdmin } from './seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'],
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Создаём администратора при первом старте (если его ещё нет).
  await seedAdmin(app.get(PrismaService));

  const port = process.env.PORT || 8000;
  await app.listen(port);
}
bootstrap();

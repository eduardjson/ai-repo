import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { PrismaService } from './prisma/prisma.service'
import { seedAdmin, seedCatalog } from './seed'
import { setupSwagger } from './swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'],
    credentials: true,
  })

  app.use(cookieParser())
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Swagger UI на /api/docs, raw JSON на /api/docs-json.
  setupSwagger(app)

  // Создаём администратора и справочники/номенклатуру при первом старте.
  const prisma = app.get(PrismaService)
  await seedAdmin(prisma)
  await seedCatalog(prisma)

  const port = process.env.PORT || 8000
  await app.listen(port)
}
bootstrap()

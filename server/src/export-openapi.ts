import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

/**
 * Экспортирует OpenAPI-спецификацию в файл openapi.json (в корень репозитория)
 * без запуска HTTP-сервера и без обращения к БД. Используется кодогенератором
 * на фронтенде, чтобы не зависеть от запущенного бэкенда.
 */
async function exportOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = setupSwagger(app);

  const outPath = resolve(__dirname, '..', '..', 'openapi.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2));
  // eslint-disable-next-line no-console
  console.log(`OpenAPI spec written to ${outPath}`);

  await app.close();
}

exportOpenApi().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

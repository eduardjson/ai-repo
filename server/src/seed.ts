import * as bcrypt from 'bcrypt';
import type { PrismaService } from './prisma/prisma.service';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

/**
 * Создаёт администратора при первом старте, если его ещё нет.
 *
 * Учётные данные берутся из переменных окружения ADMIN_EMAIL / ADMIN_PASSWORD
 * (в development — значения по умолчанию). Повторный запуск ничего не меняет,
 * поэтому пароль не перезаписывается после того, как администратор его сменит.
 */
export async function seedAdmin(prisma: PrismaService): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    return;
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      '[seed] ADMIN_PASSWORD не задан — используются учётные данные по умолчанию. ' +
        'Задайте ADMIN_EMAIL/ADMIN_PASSWORD в переменных окружения для production.',
    );
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password,
      firstName: 'Администратор',
      role: ['ADMIN'] as any,
    },
  });

  console.log(`[seed] Создан администратор: ${ADMIN_EMAIL}`);
}

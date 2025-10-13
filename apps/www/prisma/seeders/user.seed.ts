import { hashPassword } from '@libs/hasher/hasher';
import { PrismaClient } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  await prisma.user.deleteMany();

  const user = await prisma.user.upsert({
    where: { email: 'test@myapp.com' },
    update: {},
    create: {
      email: 'test@myapp.com',
      name: 'test',
      emailVerified: null,
      credentials: {
        create: {
          password: await hashPassword('test'),
        },
      },
    },
  });

  return user;
}

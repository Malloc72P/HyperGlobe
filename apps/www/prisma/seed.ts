import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/user.seed';
import { seedDataset } from './seeders/dataset.seed';

const prisma = new PrismaClient();

async function main() {
  const user = await seedUsers(prisma);
  await seedDataset(prisma, user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

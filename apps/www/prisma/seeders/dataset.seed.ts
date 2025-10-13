import { PrismaClient, User } from '@prisma/client';

export async function seedDataset(prisma: PrismaClient, tester: User) {
  await prisma.dataset.deleteMany();

  await prisma.dataset.createMany({
    data: ['Dataset 1', 'Dataset 2', 'Dataset 3'].map((title, index) => ({
      title,
      description: `Description for ${title}`,
      ownerId: tester.id,
    })),
  });
}

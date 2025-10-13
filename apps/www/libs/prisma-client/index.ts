import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error'] // 개발 환경에서만 자세히 로깅
        : ['error'], // 프로덕션은 최소한으로
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma; // 개발 모드에서만 전역 캐싱
}

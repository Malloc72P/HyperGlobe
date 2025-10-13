'use server';

import { UnauthenticatedError } from '@libs/error/user.error';
import { prisma } from '@libs/prisma-client';
import { User } from '@prisma/client';
import { authOptions } from 'app/api/auth/[...nextauth]/auth-options';
import { getServerSession } from 'next-auth';

export async function validateUserAction(): Promise<User> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new UnauthenticatedError('로그인이 필요합니다');
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    throw new UnauthenticatedError('사용자를 찾을 수 없습니다');
  }

  return user;
}

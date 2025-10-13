'use server';

import {
  CredentialLoginNotAllowedError,
  LoginError,
  UserNotFoundError,
} from '@libs/error/user.error';
import { verifyPassword } from '@libs/hasher/hasher';
import { prisma } from '@libs/prisma-client';

export interface VerifyPasswordLoginParam {
  email: string;
  password: string;
}

export async function verifyPasswordLoginAction({ email, password }: VerifyPasswordLoginParam) {
  const foundUser = await prisma.user.findUnique({
    where: { email },
    include: { credentials: true },
  });

  if (!foundUser) {
    throw new UserNotFoundError('해당 이메일로 가입된 유저 정보가 존재하지 않습니다.');
  }

  if (!foundUser.credentials) {
    throw new CredentialLoginNotAllowedError(
      '비밀번호 정보가 존재하지 않아 해당 방식의 로그인이 지원되지 않습니다.'
    );
  }

  const isVerified = await verifyPassword(foundUser.credentials.password, password);

  if (!isVerified) {
    throw new LoginError('패스워드가 일치하지 않습니다.');
  }

  // 민감한 정보는 리턴조차 하지 않는다.
  foundUser.credentials = null;

  return foundUser;
}

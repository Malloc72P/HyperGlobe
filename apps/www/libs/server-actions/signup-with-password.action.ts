'use server';

import { SignupWithPasswordParam, SignupWithPasswordParamSchema } from '@libs/dto/user/sign-up.dto';
import { handleServerActionError } from './etc/handle-server-action-error';
import { IServerActionResponse } from './etc/server-action-interface';
import { ServerActionResult } from './etc/server-action-result';
import { ServerError } from '@libs/error/common.error';
import { hashPassword } from '@libs/hasher/hasher';
import { prisma } from '@libs/prisma-client';

export async function signupWithPasswordAction(
  param: SignupWithPasswordParam
): Promise<IServerActionResponse> {
  try {
    const { name, email, password } = SignupWithPasswordParamSchema.parse(param);

    const foundUser = await prisma.user.findUnique({ where: { email: param.email } });

    if (foundUser) {
      throw new ServerError('이미 가입된 사용자입니다. 다른 이메일을 사용해서 가입해주세요.');
    }

    await prisma.user.create({
      data: {
        name,
        email,
        credentials: {
          create: {
            password: await hashPassword(password),
          },
        },
      },
    });

    return new ServerActionResult(true).toPlain();
  } catch (error) {
    return handleServerActionError(error, {
      invoker: 'signupWithPasswordAction',
      zodErrorMessage: '회원 가입에 실패했습니다. 입력을 확인해주세요.',
    });
  }
}

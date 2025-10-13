import { SignInInputDtoSchema } from '@libs/dto/user/sign-in.dto';
import { LoginError } from '@libs/error/user.error';
import { verifyPasswordLoginAction } from '@libs/server-actions/verify-password-login.action';
import { Awaitable, RequestInternal, User } from 'next-auth';
import { ZodError } from 'zod';

export const NextAuthCredentialInfo = {
  email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
  password: { label: 'Password', type: 'password' },
};

type AuthorizeFn = (
  credentials: Record<keyof typeof NextAuthCredentialInfo, string> | undefined,
  req: Pick<RequestInternal, 'body' | 'query' | 'headers' | 'method'>
) => Awaitable<User | null>;

export const authorize: AuthorizeFn = async (credentials, req) => {
  try {
    let { email, password } = SignInInputDtoSchema.parse(credentials);

    // 사용자 로그인 검사
    const loginUser = await verifyPasswordLoginAction({ email, password });

    if (!loginUser) {
      throw new LoginError('로그인에 실패하였습니다. 이메일 또는 패스워드를 다시 확인해주세요');
    }

    // 리턴한 객체는 JWT의 user 속성에 저장된다.
    return {
      id: loginUser.id,
      email: loginUser.email,
      name: loginUser.name,
    };
  } catch (error) {
    // 입력 오류에 대한 힌트는 알려준다.
    if (error instanceof ZodError) {
      throw new Error(error.errors.map((e) => e.message).join(' '));
    }

    // 자세한 에러 내용을 클라이언트에게 노출하지 않는다.
    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
    throw new LoginError('로그인에 실패하였습니다. 이메일 또는 패스워드를 다시 확인해주세요');
  }

  // If you return null then an error will be displayed advising the user to check their details.
  //   return null;
};

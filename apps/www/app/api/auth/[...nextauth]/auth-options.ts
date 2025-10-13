import { NextAuthOptions } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import { authorize, NextAuthCredentialInfo } from './authorize';

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialProvider({
      name: 'Credentials',
      credentials: NextAuthCredentialInfo,
      authorize,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 로그인 직후 최초 호출되는 jwt는 user 매개변수가 존재함

      if (user) {
        // user를 사용해서 토큰에 필요한 데이터 주입.
        // 해당 객체는 authorize에서 반환한 객체임.
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      // 클라이언트에서 useSession() 할 때 session.user에 심어줄 필드.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }

      return session;
    },
  },
  session: { strategy: 'jwt' },
};

import z from 'zod';

export const SignupWithPasswordParamSchema = z.object({
  name: z.string().nonempty('이름을 입력해주세요'),
  email: z.string().nonempty('이메일을 입력해주세요').email('이메일 형식으로 입력해주세요'),
  password: z
    .string()
    .nonempty('비밀번호를 입력해주세요')
    .min(8, '비밀번호가 너무 짧습니다. 8자리 이상의 비밀번호를 입력해주세요.'),
});

export type SignupWithPasswordParam = z.infer<typeof SignupWithPasswordParamSchema>;

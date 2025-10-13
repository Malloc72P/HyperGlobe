import { z } from 'zod';

export const SignInInputDtoSchema = z.object({
  email: z.string().email({
    message: '이메일 주소가 올바르지 않습니다.',
  }),
  password: z.string(),
});

export type SignInInputDto = z.infer<typeof SignInInputDtoSchema>;

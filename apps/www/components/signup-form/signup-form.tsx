'use client';

import { Logo } from '@components/logo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigator } from '@hooks/use-navigator';
import { notifySuccess } from '@hooks/use-notification';
import { SignupWithPasswordParamSchema } from '@libs/dto/user/sign-up.dto';
import { IServerActionResponse } from '@libs/server-actions/etc/server-action-interface';
import { signupWithPasswordAction } from '@libs/server-actions/signup-with-password.action';
import {
  Anchor,
  Box,
  Button,
  Container,
  Flex,
  Paper,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import classes from './signup-form.module.css';

const SignupWithPasswordParamClientSchema = SignupWithPasswordParamSchema.extend({
  passwordConfirm: z.string(),
}).superRefine(({ password, passwordConfirm }, ctx) => {
  if (password !== passwordConfirm) {
    ctx.addIssue({
      path: ['passwordConfirm'],
      code: z.ZodIssueCode.custom,
      message: '비밀번호가 일치하지 않습니다.',
    });
  }
});

type SignupWithPasswordParamClient = z.infer<typeof SignupWithPasswordParamClientSchema>;

export function SignupForm() {
  const form = useForm<SignupWithPasswordParamClient>({
    resolver: zodResolver(SignupWithPasswordParamClientSchema),
  });

  const navigator = useNavigator();

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    // 입력값 검증
    setLoading(true);
    const { passwordConfirm, ...input } = form.getValues();

    try {
      // 회원가입 요청
      const result = await signupWithPasswordAction(input);

      if (!result.success) {
        throw result;
      }

      setErrorMsg('');

      notifySuccess({
        title: '회원가입 성공!',
        message: '회원가입되었습니다. 입력하신 정보로 로그인해주세요.',
      });

      navigator.moveTo.auth.login();
    } catch (error) {
      const actionError = error as IServerActionResponse;

      if (actionError.issues) {
        for (const issue of actionError.issues) {
          form.setError(issue.path[0] as any, {
            message: issue.message,
          });
        }
      }

      setErrorMsg(
        actionError.message ?? '알 수 없는 에러가 발생했습니다. 관리자에게 문의해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Flex justify={'center'}>
        <Logo ta={'center'} clickDisabled />
      </Flex>

      <Text c="dimmed" size="sm" ta="center" mt={16}>
        서비스 이용에 필요한 프로필 정보를 입력해주세요. <br />
        계정이 이미 있으신 경우,{' '}
        <Anchor size="sm" component="button" onClick={navigator.moveTo.auth.login}>
          로그인 페이지
        </Anchor>
        로 이동해주세요.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TextInput
            label="닉네임"
            required
            autoFocus
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />

          <TextInput
            label="이메일"
            mt="md"
            required
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />

          <PasswordInput
            label="비밀번호"
            required
            mt="md"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
          />

          <PasswordInput
            label="비밀번호 확인"
            required
            mt="md"
            {...form.register('passwordConfirm')}
            error={form.formState.errors.passwordConfirm?.message}
          />

          {errorMsg && (
            <Text c="red" size="sm" className={classes.error} mt="xl">
              {errorMsg}
            </Text>
          )}

          <Button mt="xl" fullWidth type="submit" loading={loading}>
            회원가입
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

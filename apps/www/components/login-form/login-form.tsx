'use client';

import { useNavigator } from '@hooks/use-navigator';
import { notifySuccess } from '@hooks/use-notification';
import {
  Anchor,
  Box,
  Button,
  Container,
  Flex,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { FormEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import classes from './login-form.module.css';

import { Logo } from '@components/logo';
import { SignInInputDto } from '@libs/dto/user/sign-in.dto';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export function LoginForm() {
  const form = useForm<SignInInputDto>();
  const navigator = useNavigator();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const param = useSearchParams();

  useEffect(() => {
    const message = param.get('m');

    if (message) {
      setErrorMsg(message);
    }
  }, []);

  const onSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      const { email, password } = form.getValues();

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      notifySuccess({
        message: '로그인 되었습니다.',
      });
      setErrorMsg('');
      setIsSuccess(true);
      navigator.moveTo.public.landing();
    } catch (error) {
      let errorMessage = '알 수 없는 에러가 발생했습니다. 관리자에게 문의해주세요.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setIsSuccess(false);
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onCreateAccountClick = () => {
    navigator.moveTo.auth.signup();
  };

  return (
    <Container size={420} my={40}>
      <Flex justify={'center'}>
        <Logo ta={'center'} clickDisabled mx={'auto'} />
      </Flex>

      <Text c="dimmed" size="sm" ta="center" mt={16}>
        아직 계정이 없으신가요?{' '}
        <Anchor size="sm" component="button" onClick={onCreateAccountClick}>
          회원가입 하기
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={onSubmit}>
          <TextInput label="이메일" autoFocus required {...form.register('email')} />
          <PasswordInput label="비밀번호" required mt="md" {...form.register('password')} />

          {errorMsg && (
            <Text c="red" size="sm" className={classes.error} mt="xl">
              {errorMsg}
            </Text>
          )}
          {isSuccess && (
            <Group gap={5} mt="xl">
              <IconCircleCheck color="green" />
              <Text fw="bold" c="green" size="sm">
                로그인 성공!
              </Text>
            </Group>
          )}

          <Button fullWidth mt="xl" type="submit" loading={loading}>
            로그인
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

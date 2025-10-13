import { LoginForm } from '@components/login-form';
import { SignupForm } from '@components/signup-form';
import { Box } from '@mantine/core';

export default function SignupPage() {
  return (
    <Box mt="20vh">
      <SignupForm />
    </Box>
  );
}

import { Env } from '@libs/env';
import * as argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 2,
    memoryCost: 2 ** 15,
    parallelism: 1,
    secret: Buffer.from(Env.get('pepper')),
  });
}

export async function verifyPassword(
  hashedPassword: string,
  inputPassword: string
): Promise<boolean> {
  return await argon2.verify(hashedPassword, inputPassword, {
    secret: Buffer.from(Env.get('pepper')),
  });
}

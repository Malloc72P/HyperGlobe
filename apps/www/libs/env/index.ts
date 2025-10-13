import { ApplicationError } from '@libs/error/common.error';
import { z } from 'zod';

const stringValidator = (key: string) =>
  z
    .string({ message: `${key}이(가) 문자열이 아닙니다.` })
    .nonempty({ message: `${key}이(가) 빈 문자열입니다.` });

const ServerSideEnvSchema = z
  .object({
    NEXTAUTH_URL: stringValidator('NEXTAUTH_URL'),
    NEXTAUTH_SECRET: stringValidator('NEXTAUTH_SECRET'),
    PEPPER: stringValidator('PEPPER'),
    DATABASE_URL: stringValidator('DATABASE_URL'),
    NODE_ENV: stringValidator('NODE_ENV'),
  })
  .transform((original) => ({
    nextauthUrl: original.NEXTAUTH_URL,
    nextauthSecret: original.NEXTAUTH_SECRET,
    pepper: original.PEPPER,
    databaseUrl: original.DATABASE_URL,
    nodeEnv: original.NODE_ENV,
  }));

type ServerSideEnv = z.infer<typeof ServerSideEnvSchema>;

export class Env {
  private static instance: Env | null = null;
  private readonly env: ServerSideEnv | null = null;

  private constructor() {
    const result = ServerSideEnvSchema.safeParse(process.env);

    if (result.success) {
      this.env = result.data;
      return;
    }

    const message =
      '환경변수가 충분하지 않습니다. \n' +
      result.error.issues.map((i) => `- ${i.message}`).join('\n');

    throw new ApplicationError(message);
  }

  public static getInstance(): Env {
    if (!Env.instance) {
      Env.instance = new Env();
    }

    if (!Env.instance.env) {
      throw new ApplicationError('Env is not prepared');
    }

    return Env.instance;
  }

  public static get(key: keyof ServerSideEnv) {
    const instance = Env.getInstance();

    return instance.env![key];
  }
}

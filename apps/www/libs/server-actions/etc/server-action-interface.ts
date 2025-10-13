import { ZodError } from 'zod';

export interface IServerActionResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  issues?: ServerActionIssue[];
}

export interface ServerActionIssue {
  path: (string | number)[];
  message: string;
}

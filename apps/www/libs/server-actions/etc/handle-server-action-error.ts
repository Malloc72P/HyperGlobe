import { ServerError } from '@libs/error/common.error';
import { ZodError } from 'zod';
import { ServerActionError } from './server-action-error';
import { IServerActionResponse } from './server-action-interface';

export interface HandleServerActionErrorOption {
  invoker: string;
  zodErrorMessage?: string;
}

const zodErrorDefaultMessage = '수행할 수 없는 명령입니다. 입력을 확인해주세요.';
export function handleServerActionError(
  error: unknown,
  option: HandleServerActionErrorOption = {
    invoker: 'Unknown',
    zodErrorMessage: zodErrorDefaultMessage,
  }
): IServerActionResponse {
  const { invoker, zodErrorMessage = zodErrorDefaultMessage } = option;

  console.error(`Server Action Error! [${invoker}]\n : `, error);

  const actionError: ServerActionError = new ServerActionError(
    '알 수 없는 에러가 발생했습니다. 관리자에게 문의해주세요.',
    []
  );

  if (error instanceof ZodError) {
    actionError.updateMessage(zodErrorMessage);
    actionError.addIssues(error);
  }

  if (error instanceof ServerError) {
    actionError.updateMessage(error.message);
  }

  return actionError.toPlain();
}

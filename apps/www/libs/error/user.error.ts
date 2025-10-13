import { ServerError } from './common.error';

export class UserNotFoundError extends ServerError {
  constructor(message: string) {
    super(message);
  }
}

export class CredentialLoginNotAllowedError extends ServerError {
  constructor(message: string) {
    super(message);
  }
}

export class LoginError extends ServerError {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthenticatedError extends ServerError {
    constructor(message: string) {
      super(message);
    }
  }

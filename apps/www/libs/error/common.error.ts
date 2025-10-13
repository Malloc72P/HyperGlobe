export interface ApplicationErrorOption {
  detail?: string;
  originalError?: any;
}

export class ApplicationError extends Error {
  detail?: string;
  originalError?: Error;

  constructor(m: string, option: ApplicationErrorOption = {}) {
    super(m);

    this.detail = option.detail;
    this.originalError = option.originalError;
  }
}

export class ServerError extends ApplicationError {
  constructor(m: string) {
    super(m);
  }
}

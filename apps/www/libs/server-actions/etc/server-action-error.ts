import { ZodError } from 'zod';
import { IServerActionResponse, ServerActionIssue } from './server-action-interface';
import { ServerActionResponse } from './server-action-response';

export class ServerActionError extends ServerActionResponse implements IServerActionResponse {
  private _message: string;
  private _issues: ServerActionIssue[];

  constructor(message: string, issues: ServerActionIssue[] = []) {
    super(false);

    this._message = message;
    this._issues = issues;
  }

  public get message(): string {
    return this._message;
  }

  public get issues(): ServerActionIssue[] {
    return this._issues;
  }

  public get data() {
    return null;
  }

  updateMessage(m: string) {
    this._message = m;
  }

  addIssues(zodError: ZodError): void;
  addIssues(issues: ServerActionIssue[]): void;
  addIssues(issuesOrZodError: ZodError | ServerActionIssue[]) {
    let issues: ServerActionIssue[] = [];

    if (Array.isArray(issuesOrZodError)) {
      issues.push(...issuesOrZodError);
    } else {
      issues.push(
        ...issuesOrZodError.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        }))
      );
    }

    this.issues.push(...issues);
  }

  override toPlain(): IServerActionResponse {
    return {
      message: this.message,
      issues: this.issues,
      success: this.success,
      data: null,
    };
  }
}

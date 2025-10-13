import { IServerActionResponse } from './server-action-interface';

export abstract class ServerActionResponse {
  success: boolean;

  constructor(success: boolean) {
    this.success = success;
  }

  abstract toPlain(): IServerActionResponse;
}

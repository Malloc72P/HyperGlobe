import { IServerActionResponse } from './server-action-interface';
import { ServerActionResponse } from './server-action-response';

export class ServerActionResult<T> extends ServerActionResponse {
  data: T;

  constructor(data: T) {
    super(true);

    this.data = data;
  }

  override toPlain(): IServerActionResponse {
    return {
      success: this.success,
      data: this.data,
    };
  }
}

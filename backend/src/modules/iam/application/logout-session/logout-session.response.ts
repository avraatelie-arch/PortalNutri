export interface LogoutSessionResult {
  sessionId: string;
}

export class LogoutSessionResponse implements LogoutSessionResult {
  private constructor(readonly sessionId: string) {}

  static from(sessionId: string): LogoutSessionResponse {
    return new LogoutSessionResponse(sessionId);
  }
}

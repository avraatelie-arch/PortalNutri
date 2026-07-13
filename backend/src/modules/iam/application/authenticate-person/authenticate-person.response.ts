export interface AuthenticatePersonResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  sessionId: string;
}

export class AuthenticatePersonResponse implements AuthenticatePersonResult {
  private constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
    readonly accessTokenExpiresAt: Date,
    readonly sessionId: string,
  ) {}

  static from(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresAt: Date,
    sessionId: string,
  ): AuthenticatePersonResponse {
    return new AuthenticatePersonResponse(
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      sessionId,
    );
  }
}

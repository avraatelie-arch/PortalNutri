export interface RefreshSessionResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  sessionId: string;
}

export class RefreshSessionResponse implements RefreshSessionResult {
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
  ): RefreshSessionResponse {
    return new RefreshSessionResponse(
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      sessionId,
    );
  }
}

export interface RefreshSessionResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshSessionResponse implements RefreshSessionResult {
  private constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

  static from(
    accessToken: string,
    refreshToken: string,
  ): RefreshSessionResponse {
    return new RefreshSessionResponse(accessToken, refreshToken);
  }
}

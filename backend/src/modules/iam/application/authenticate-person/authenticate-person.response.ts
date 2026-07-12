export interface AuthenticatePersonResult {
  accessToken: string;
  refreshToken: string;
}

export class AuthenticatePersonResponse implements AuthenticatePersonResult {
  private constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
  ) {}

  static from(
    accessToken: string,
    refreshToken: string,
  ): AuthenticatePersonResponse {
    return new AuthenticatePersonResponse(accessToken, refreshToken);
  }
}

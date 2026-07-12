export interface AccessTokenClaims {
  personId: string;
  sessionId: string;
  tenantId: string | null;
  jti: string;
}

export interface TokenService {
  issueAccessToken(claims: {
    personId: string;
    sessionId: string;
    tenantId: string | null;
  }): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
  generateRefreshTokenSecret(): string;
  formatRefreshToken(sessionId: string, secret: string): string;
  parseRefreshToken(token: string): { sessionId: string; secret: string };
  hashRefreshToken(secret: string): string;
  computeSessionExpiresAt(now?: Date): Date;
  computeRefreshTokenExpiresAt(sessionExpiresAt: Date, now?: Date): Date;
}

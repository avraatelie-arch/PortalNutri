import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import type { JwtConfig } from '../../../../config/jwt.js';
import {
  computeRefreshTokenExpiresAt,
  computeSessionExpiresAt,
} from '../../../../config/jwt.js';
import type {
  AccessTokenClaims,
  TokenService,
} from '../../application/services/token-service.port.js';
import { InvalidAccessTokenError } from '../../application/errors/invalid-access-token.error.js';
import { InvalidRefreshTokenError } from '../../application/errors/invalid-refresh-token.error.js';

const REFRESH_TOKEN_SEPARATOR = '.';

export class JoseTokenService implements TokenService {
  private readonly secretKey: Uint8Array;

  constructor(private readonly config: JwtConfig) {
    this.secretKey = new TextEncoder().encode(config.secret);
  }

  async issueAccessToken(claims: {
    personId: string;
    sessionId: string;
    tenantId: string | null;
  }): Promise<string> {
    const jti = crypto.randomUUID();
    const builder = new SignJWT({
      sid: claims.sessionId,
      ...(claims.tenantId ? { tid: claims.tenantId } : {}),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(claims.personId)
      .setIssuer(this.config.issuer)
      .setJti(jti)
      .setIssuedAt();

    return builder
      .setExpirationTime(this.config.accessTokenTtl)
      .sign(this.secretKey);
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        issuer: this.config.issuer,
      });

      const personId = typeof payload.sub === 'string' ? payload.sub : null;
      const sessionId =
        typeof payload.sid === 'string' ? payload.sid : null;
      const tenantId =
        typeof payload.tid === 'string' ? payload.tid : null;
      const jti = typeof payload.jti === 'string' ? payload.jti : null;

      if (!personId || !sessionId || !jti) {
        throw new InvalidAccessTokenError();
      }

      return {
        personId,
        sessionId,
        tenantId,
        jti,
      };
    }
    catch (error) {
      if (error instanceof InvalidAccessTokenError) {
        throw error;
      }

      throw new InvalidAccessTokenError();
    }
  }

  generateRefreshTokenSecret(): string {
    return randomBytes(32).toString('base64url');
  }

  formatRefreshToken(sessionId: string, secret: string): string {
    return `${sessionId}${REFRESH_TOKEN_SEPARATOR}${secret}`;
  }

  parseRefreshToken(token: string): { sessionId: string; secret: string } {
    const separatorIndex = token.indexOf(REFRESH_TOKEN_SEPARATOR);

    if (separatorIndex <= 0 || separatorIndex === token.length - 1) {
      throw new InvalidRefreshTokenError();
    }

    return {
      sessionId: token.slice(0, separatorIndex),
      secret: token.slice(separatorIndex + 1),
    };
  }

  hashRefreshToken(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }

  computeSessionExpiresAt(now: Date = new Date()): Date {
    return computeSessionExpiresAt(this.config, now);
  }

  computeRefreshTokenExpiresAt(
    sessionExpiresAt: Date,
    now: Date = new Date(),
  ): Date {
    return computeRefreshTokenExpiresAt(this.config, sessionExpiresAt, now);
  }
}

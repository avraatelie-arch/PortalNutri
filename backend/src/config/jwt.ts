import type { Env } from './env.js';
import { addDuration, minDate, parseDurationToMs } from './duration.js';

export interface JwtConfig {
  secret: string;
  issuer: string;
  accessTokenTtl: string;
  refreshTokenTtl: string;
  sessionTtl: string;
  accessTokenTtlMs: number;
  refreshTokenTtlMs: number;
  sessionTtlMs: number;
}

export function buildJwtConfig(env: Env): JwtConfig {
  const accessTokenTtlMs = parseDurationToMs(env.JWT_ACCESS_TOKEN_TTL);
  const refreshTokenTtlMs = parseDurationToMs(env.JWT_REFRESH_TOKEN_TTL);
  const sessionTtlMs = parseDurationToMs(env.JWT_SESSION_TTL);

  return {
    secret: env.JWT_SECRET,
    issuer: env.JWT_ISSUER,
    accessTokenTtl: env.JWT_ACCESS_TOKEN_TTL,
    refreshTokenTtl: env.JWT_REFRESH_TOKEN_TTL,
    sessionTtl: env.JWT_SESSION_TTL,
    accessTokenTtlMs,
    refreshTokenTtlMs,
    sessionTtlMs,
  };
}

export function computeSessionExpiresAt(
  config: JwtConfig,
  now: Date = new Date(),
): Date {
  return addDuration(now, config.sessionTtl);
}

export function computeRefreshTokenExpiresAt(
  config: JwtConfig,
  sessionExpiresAt: Date,
  now: Date = new Date(),
): Date {
  return minDate(
    addDuration(now, config.refreshTokenTtl),
    sessionExpiresAt,
  );
}

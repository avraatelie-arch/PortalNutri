import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Env } from './env.js';
import { buildLoggerOptions } from './logger.js';

const VALID_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/portalnutri?schema=public';

function createEnv(overrides: Partial<Env> = {}): Env {
  return {
    NODE_ENV: 'development',
    PORT: 3333,
    HOST: '0.0.0.0',
    DATABASE_URL: VALID_DATABASE_URL,
    CORS_ORIGIN: '*',
    corsOrigins: '*',
    ARGON2_TIME_COST: 3,
    ARGON2_MEMORY_COST: 65536,
    ARGON2_PARALLELISM: 4,
    ARGON2_PARALLELISM: 4,
    JWT_SECRET: 'test-jwt-secret-with-at-least-32-characters!!',
    JWT_ISSUER: 'portalnutri',
    JWT_ACCESS_TOKEN_TTL: '15m',
    JWT_REFRESH_TOKEN_TTL: '7d',
    JWT_SESSION_TTL: '30d',
    OPENAPI_ENABLED: true,
    LOG_LEVEL: 'info',
    LOG_PRETTY: true,
    ...overrides,
  };
}

function hasPrettyTransport(options: ReturnType<typeof buildLoggerOptions>): boolean {
  return (
    typeof options === 'object' &&
    options !== null &&
    'transport' in options &&
    options.transport !== undefined
  );
}

describe('buildLoggerOptions', () => {
  it('uses silent logs in test environment', () => {
    const options = buildLoggerOptions(createEnv({ NODE_ENV: 'test' }));

    assert.equal(options.level, 'silent');
    assert.equal(hasPrettyTransport(options), false);
  });

  it('enables pretty transport in development by default', () => {
    const options = buildLoggerOptions(
      createEnv({ NODE_ENV: 'development', LOG_PRETTY: true }),
    );

    assert.equal(options.level, 'info');
    assert.equal(hasPrettyTransport(options), true);
  });

  it('disables pretty transport when LOG_PRETTY is false in development', () => {
    const options = buildLoggerOptions(
      createEnv({ NODE_ENV: 'development', LOG_PRETTY: false }),
    );

    assert.equal(hasPrettyTransport(options), false);
  });

  it('uses JSON logs in production even when LOG_PRETTY is true', () => {
    const options = buildLoggerOptions(
      createEnv({ NODE_ENV: 'production', LOG_PRETTY: true }),
    );

    assert.equal(options.level, 'info');
    assert.equal(hasPrettyTransport(options), false);
  });

  it('respects LOG_LEVEL override', () => {
    const options = buildLoggerOptions(
      createEnv({ NODE_ENV: 'production', LOG_LEVEL: 'warn' }),
    );

    assert.equal(options.level, 'warn');
  });
});

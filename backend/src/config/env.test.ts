import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseEnv } from './env.js';

const VALID_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/portalnutri?schema=public';

function validEnv(
  overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  return {
    NODE_ENV: 'development',
    PORT: '3333',
    HOST: '0.0.0.0',
    DATABASE_URL: VALID_DATABASE_URL,
    CORS_ORIGIN: '*',
    LOG_LEVEL: 'info',
    ...overrides,
  };
}

function assertEnvValidationFails(
  source: Record<string, string | undefined>,
  expectedMessage: string,
): void {
  assert.throws(() => parseEnv(source), (error: Error) => {
    assert.match(error.message, /Invalid environment configuration/);
    assert.match(error.message, new RegExp(expectedMessage));
    return true;
  });
}

describe('parseEnv', () => {
  it('parses a valid environment', () => {
    const env = parseEnv(validEnv());

    assert.equal(env.NODE_ENV, 'development');
    assert.equal(env.PORT, 3333);
    assert.equal(env.HOST, '0.0.0.0');
    assert.equal(env.DATABASE_URL, VALID_DATABASE_URL);
    assert.equal(env.CORS_ORIGIN, '*');
    assert.equal(env.corsOrigins, '*');
    assert.equal(env.LOG_LEVEL, 'info');
    assert.equal(env.LOG_PRETTY, true);
    assert.equal(env.OPENAPI_ENABLED, true);
  });

  it('fails when DATABASE_URL is missing', () => {
    assertEnvValidationFails(
      validEnv({ DATABASE_URL: undefined }),
      'DATABASE_URL is required',
    );
  });

  it('fails when DATABASE_URL is invalid', () => {
    assertEnvValidationFails(
      validEnv({ DATABASE_URL: 'mysql://localhost:3306/app' }),
      'DATABASE_URL must be a valid PostgreSQL connection URL',
    );
  });

  it('fails when PORT is invalid', () => {
    assertEnvValidationFails(
      validEnv({ PORT: '70000' }),
      'PORT must be an integer between 1 and 65535',
    );
  });

  it('fails when LOG_LEVEL is invalid', () => {
    assertEnvValidationFails(
      validEnv({ LOG_LEVEL: 'verbose' }),
      'LOG_LEVEL must be one of trace, debug, info, warn, error, fatal, silent',
    );
  });

  it('fails when LOG_PRETTY is invalid', () => {
    assertEnvValidationFails(
      validEnv({ LOG_PRETTY: 'yes' }),
      'Must be "true" or "false"',
    );
  });

  it('fails when OPENAPI_ENABLED is invalid', () => {
    assertEnvValidationFails(
      validEnv({ OPENAPI_ENABLED: 'enabled' }),
      'Must be "true" or "false"',
    );
  });

  it('fails when CORS_ORIGIN is empty', () => {
    assertEnvValidationFails(
      validEnv({ CORS_ORIGIN: '' }),
      'CORS_ORIGIN must be a non-empty string',
    );
  });

  it('fails when CORS_ORIGIN is only empty comma-separated entries', () => {
    assertEnvValidationFails(
      validEnv({ CORS_ORIGIN: ' , , ' }),
      'CORS_ORIGIN must contain at least one non-empty origin',
    );
  });

  it('rejects wildcard CORS_ORIGIN in production', () => {
    assertEnvValidationFails(
      validEnv({ NODE_ENV: 'production', CORS_ORIGIN: '*' }),
      'cannot be "\\*" in production',
    );
  });

  it('parses comma-separated CORS_ORIGIN into corsOrigins', () => {
    const env = parseEnv(
      validEnv({
        CORS_ORIGIN: ' https://app.example.com , https://admin.example.com ',
      }),
    );

    assert.deepEqual(env.corsOrigins, [
      'https://app.example.com',
      'https://admin.example.com',
    ]);
  });

  it('allows wildcard CORS_ORIGIN outside production', () => {
    const env = parseEnv(validEnv({ NODE_ENV: 'test', CORS_ORIGIN: '*' }));

    assert.equal(env.corsOrigins, '*');
  });

  it('defaults HOST to 0.0.0.0 when omitted', () => {
    const env = parseEnv(validEnv({ HOST: undefined }));

    assert.equal(env.HOST, '0.0.0.0');
  });
});

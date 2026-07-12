import { buildJwtConfig, type JwtConfig } from '../config/jwt.js';
import { parseEnv } from '../config/env.js';

export const TEST_JWT_SECRET =
  'test-jwt-secret-with-at-least-32-characters!!';

const VALID_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/portalnutri?schema=public';

export function createTestJwtConfig(
  overrides: Record<string, string | undefined> = {},
): JwtConfig {
  return buildJwtConfig(
    parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: VALID_DATABASE_URL,
      JWT_SECRET: TEST_JWT_SECRET,
      ...overrides,
    }),
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function requireDatabaseUrl(): void {
  if (!isDatabaseConfigured()) {
    throw new Error(
      'Integration tests require PostgreSQL. Set DATABASE_URL before running pnpm test:integration.',
    );
  }
}

export function configureIntegrationTestEnv(): void {
  requireDatabaseUrl();
  process.env.NODE_ENV = 'test';
  process.env.OPENAPI_ENABLED = 'false';
  process.env.JWT_SECRET =
    process.env.JWT_SECRET ??
    'test-jwt-secret-with-at-least-32-characters!!';
}

import type { FastifyInstance, InjectOptions } from 'fastify';
import { SignJWT } from 'jose';
import { buildApp } from '../app.js';
import { buildArgon2Config } from '../config/argon2.js';
import { configureIntegrationTestEnv } from '../config/test-env.js';
import { parseEnv } from '../config/env.js';
import { getPrismaClient } from '../core/database/prisma-client.js';
import { RegisterCredentialCommand } from '../modules/iam/application/register-credential/register-credential.command.js';
import { RegisterCredentialHandler } from '../modules/iam/application/register-credential/register-credential.handler.js';
import { Argon2PasswordHasher } from '../modules/iam/infrastructure/cryptography/argon2-password-hasher.js';
import { PrismaCredentialRepository } from '../modules/iam/infrastructure/repositories/prisma-credential.repository.js';
import { PrismaPersonRepository } from '../modules/iam/infrastructure/repositories/prisma-person.repository.js';
import {
  seedPersonFixture,
  type SeededPerson,
} from './person-http-test.harness.js';
import { TEST_JWT_SECRET } from './jwt-test.config.js';
import {
  bindSessionTenant,
  seedRbacFixture,
  type IamPermissionName,
  type PermissionApiPermissionName,
  type PersonPermissionName,
  type RolePermissionName,
} from './rbac-test.harness.js';

export { requireDatabaseUrl } from '../config/test-env.js';

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  sessionId: string;
}

export interface AuthenticatedFixture extends SeededPerson {
  password: string;
  tokens: AuthTokenResponse;
}

export async function createAuthHttpTestApp(): Promise<FastifyInstance> {
  configureIntegrationTestEnv();
  return buildApp();
}

export async function createAuthHttpTestAppWithEnv(
  envOverrides: Record<string, string | undefined>,
): Promise<FastifyInstance> {
  configureIntegrationTestEnv();

  for (const [key, value] of Object.entries(envOverrides)) {
    if (value === undefined) {
      delete process.env[key];
    }
    else {
      process.env[key] = value;
    }
  }

  return buildApp();
}

export async function injectJson(
  app: FastifyInstance,
  options: InjectOptions,
): Promise<{ statusCode: number; body: unknown }> {
  const response = await app.inject(options);

  let body: unknown = response.body;

  if (response.headers['content-type']?.includes('application/json')) {
    body = response.json();
  }

  return {
    statusCode: response.statusCode,
    body,
  };
}

export async function registerCredentialForPerson(
  app: FastifyInstance,
  personId: string,
  password = 'SecureP@ssw0rd',
) {
  return injectJson(app, {
    method: 'POST',
    url: '/api/auth/credentials',
    payload: {
      personId,
      password,
    },
  });
}

export async function loginWithCredentials(
  app: FastifyInstance,
  email: string,
  password: string,
): Promise<AuthTokenResponse> {
  const response = await injectJson(app, {
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email,
      password,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(`Login failed with status ${response.statusCode}`);
  }

  return response.body as AuthTokenResponse;
}

export async function seedCredentialInDatabase(
  personId: string,
  password = 'SecureP@ssw0rd',
): Promise<void> {
  const prisma = getPrismaClient();
  const env = parseEnv({
    NODE_ENV: 'test',
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: TEST_JWT_SECRET,
  });
  const handler = new RegisterCredentialHandler(
    new PrismaPersonRepository(prisma),
    new PrismaCredentialRepository(prisma),
    new Argon2PasswordHasher(buildArgon2Config(env)),
  );

  await handler.execute(
    new RegisterCredentialCommand({
      personId,
      password,
    }),
  );
}

export async function seedAuthenticatedFixture(
  app: FastifyInstance,
  password = 'SecureP@ssw0rd',
): Promise<AuthenticatedFixture> {
  const seeded = await seedPersonFixture();
  const credentialResponse = await registerCredentialForPerson(
    app,
    seeded.personId,
    password,
  );

  if (credentialResponse.statusCode !== 201) {
    throw new Error(
      `Credential registration failed with status ${credentialResponse.statusCode}`,
    );
  }

  const tokens = await loginWithCredentials(app, seeded.email, password);

  return {
    ...seeded,
    password,
    tokens,
  };
}

export async function grantPersonPermissions(
  personId: string,
  sessionId: string,
  permissions: PersonPermissionName[],
): Promise<string> {
  const fixture = await seedRbacFixture({
    personId,
    permissions,
  });

  await bindSessionTenant(sessionId, fixture.tenantId);

  return fixture.tenantId;
}

export async function grantTenantPermissions(
  personId: string,
  sessionId: string,
  permissions: Extract<
    IamPermissionName,
    'TENANT_READ' | 'TENANT_CREATE' | 'TENANT_UPDATE'
  >[],
): Promise<string> {
  const fixture = await seedRbacFixture({
    personId,
    permissions,
  });

  await bindSessionTenant(sessionId, fixture.tenantId);

  return fixture.tenantId;
}

export async function grantMembershipPermissions(
  personId: string,
  sessionId: string,
  permissions: Extract<
    IamPermissionName,
    'MEMBERSHIP_READ' | 'MEMBERSHIP_CREATE' | 'MEMBERSHIP_DELETE'
  >[],
): Promise<string> {
  const fixture = await seedRbacFixture({
    personId,
    permissions,
  });

  await bindSessionTenant(sessionId, fixture.tenantId);

  return fixture.tenantId;
}

export async function grantRolePermissions(
  personId: string,
  sessionId: string,
  permissions: RolePermissionName[],
): Promise<string> {
  const fixture = await seedRbacFixture({
    personId,
    permissions,
  });

  await bindSessionTenant(sessionId, fixture.tenantId);

  return fixture.tenantId;
}

export async function grantPermissionApiPermissions(
  personId: string,
  sessionId: string,
  permissions: PermissionApiPermissionName[],
): Promise<string> {
  const fixture = await seedRbacFixture({
    personId,
    permissions,
  });

  await bindSessionTenant(sessionId, fixture.tenantId);

  return fixture.tenantId;
}

export async function selectTenantForSession(
  app: FastifyInstance,
  accessToken: string,
  tenantId: string,
): Promise<{ statusCode: number; body: unknown }> {
  return injectJson(
    app,
    withBearerToken(accessToken, {
      method: 'POST',
      url: '/api/auth/select-tenant',
      payload: { tenantId },
    }),
  );
}

export function withBearerToken(
  accessToken: string,
  options: InjectOptions,
): InjectOptions {
  return {
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${accessToken}`,
    },
  };
}

export async function createExpiredAccessToken(
  personId: string,
  sessionId: string,
): Promise<string> {
  const secretKey = new TextEncoder().encode(TEST_JWT_SECRET);
  const issuedAt = Math.floor(Date.now() / 1000) - 3600;
  const expiresAt = Math.floor(Date.now() / 1000) - 1800;

  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(personId)
    .setIssuer('portalnutri')
    .setJti(crypto.randomUUID())
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(secretKey);
}

export async function lockCredentialForPerson(personId: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.credential.update({
    where: { personId },
    data: { status: 'LOCKED' },
  });
}

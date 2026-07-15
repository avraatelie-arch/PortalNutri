import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { UNAUTHORIZED_MESSAGE } from '../../application/authentication/unauthorized-response.js';
import {
  createAuthHttpTestApp,
  createAuthHttpTestAppWithEnv,
  createExpiredAccessToken,
  grantPersonPermissions,
  injectJson,
  lockCredentialForPerson,
  loginWithCredentials,
  registerCredentialForPerson,
  requireDatabaseUrl,
  seedAuthenticatedFixture,
  seedCredentialInDatabase,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';
import {
  resetPersons,
  seedInactivePersonFixture,
  seedPersonFixture,
} from '../../../../test-support/person-http-test.harness.js';

requireDatabaseUrl();

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';
const PRODUCTION_JWT_SECRET = 'a'.repeat(64);

function assertUnauthorized(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 401,
    error: 'Unauthorized',
    message: UNAUTHORIZED_MESSAGE,
  });
}

describe('Auth HTTP routes (integration)', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await createAuthHttpTestApp();
  });

  beforeEach(async () => {
    await resetPersons();
  });

  after(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('returns tokens on successful login', async () => {
      const seeded = await seedPersonFixture({
        email: 'login.success@example.com',
        documentValue: 'LOGIN001',
      });

      await registerCredentialForPerson(app, seeded.personId, 'SecureP@ssw0rd');

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: seeded.email,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: string;
        sessionId?: string;
      };

      assert.match(body.accessToken ?? '', /^eyJ/);
      assert.ok(body.refreshToken);
      assert.match(body.expiresAt ?? '', /^\d{4}-\d{2}-\d{2}T/);
      assert.match(body.sessionId ?? '', /^[0-9a-f-]{36}$/i);
    });

    it('does not expose domain or application events in the login response', async () => {
      const seeded = await seedPersonFixture({
        email: 'login.no-events@example.com',
        documentValue: 'LOGIN099',
      });

      await registerCredentialForPerson(app, seeded.personId, 'SecureP@ssw0rd');

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: seeded.email,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as Record<string, unknown>;

      assert.deepEqual(Object.keys(body).sort(), [
        'accessToken',
        'expiresAt',
        'refreshToken',
        'sessionId',
      ]);
      assert.equal('eventName' in body, false);
      assert.equal('occurredAt' in body, false);
      assert.equal('events' in body, false);
    });

    it('returns 401 for wrong password', async () => {
      const seeded = await seedPersonFixture({
        email: 'login.wrong-password@example.com',
        documentValue: 'LOGIN002',
      });

      await registerCredentialForPerson(app, seeded.personId, 'SecureP@ssw0rd');

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: seeded.email,
          password: 'WrongP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns 401 for unknown email', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'unknown@example.com',
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns 401 for inactive credential', async () => {
      const seeded = await seedPersonFixture({
        email: 'login.inactive-credential@example.com',
        documentValue: 'LOGIN003',
      });

      await registerCredentialForPerson(app, seeded.personId, 'SecureP@ssw0rd');
      await lockCredentialForPerson(seeded.personId);

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: seeded.email,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });
  });

  describe('Protected endpoints', () => {
    it('returns 401 without bearer token on GET /api/auth/me', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: '/api/auth/me',
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns 401 without bearer token on GET /api/iam/persons/:id', async () => {
      const seeded = await seedPersonFixture({
        documentValue: 'PROT001',
      });

      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/iam/persons/${seeded.personId}`,
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns 401 for invalid bearer token', async () => {
      const response = await injectJson(
        app,
        withBearerToken('invalid.token.value', {
          method: 'GET',
          url: '/api/auth/me',
        }),
      );

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns 401 for expired JWT', async () => {
      const auth = await seedAuthenticatedFixture(app);
      const expiredToken = await createExpiredAccessToken(
        auth.personId,
        auth.tokens.sessionId,
      );

      const response = await injectJson(
        app,
        withBearerToken(expiredToken, {
          method: 'GET',
          url: '/api/auth/me',
        }),
      );

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns 401 when session is revoked', async () => {
      const auth = await seedAuthenticatedFixture(app);

      const logout = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'POST',
          url: '/api/auth/logout',
        }),
      );

      assert.equal(logout.statusCode, 204);

      const response = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'GET',
          url: '/api/auth/me',
        }),
      );

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns person data on protected GET /api/iam/persons/:id', async () => {
      const auth = await seedAuthenticatedFixture(app);

      await grantPersonPermissions(
        auth.personId,
        auth.tokens.sessionId,
        ['PERSON_READ'],
      );

      const response = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'GET',
          url: `/api/iam/persons/${auth.personId}`,
        }),
      );

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; email?: string };

      assert.equal(body.id, auth.personId);
      assert.equal(body.email, auth.email);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns a new token pair on success', async () => {
      const auth = await seedAuthenticatedFixture(app);

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/refresh',
        payload: {
          refreshToken: auth.tokens.refreshToken,
        },
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: string;
        sessionId?: string;
      };

      assert.ok(body.accessToken);
      assert.notEqual(body.refreshToken, auth.tokens.refreshToken);
      assert.equal(body.sessionId, auth.tokens.sessionId);
      assert.match(body.expiresAt ?? '', /^\d{4}-\d{2}-\d{2}T/);
    });

    it('returns 401 for invalid refresh token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/refresh',
        payload: {
          refreshToken: '550e8400-e29b-41d4-a716-446655440000.invalid-secret',
        },
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });

    it('returns 401 when refresh session is revoked', async () => {
      const auth = await seedAuthenticatedFixture(app);

      await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'POST',
          url: '/api/auth/logout',
        }),
      );

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/refresh',
        payload: {
          refreshToken: auth.tokens.refreshToken,
        },
      });

      assert.equal(response.statusCode, 401);
      assertUnauthorized(response.body);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 204 and invalidates the session', async () => {
      const auth = await seedAuthenticatedFixture(app);

      const response = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'POST',
          url: '/api/auth/logout',
        }),
      );

      assert.equal(response.statusCode, 204);
      assert.equal(response.body, '');

      const me = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'GET',
          url: '/api/auth/me',
        }),
      );

      assert.equal(me.statusCode, 401);
      assertUnauthorized(me.body);
    });

    it('remains idempotent on repeated logout', async () => {
      const auth = await seedAuthenticatedFixture(app);

      const first = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'POST',
          url: '/api/auth/logout',
        }),
      );

      const second = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'POST',
          url: '/api/auth/logout',
        }),
      );

      assert.equal(first.statusCode, 204);
      assert.equal(second.statusCode, 401);
      assertUnauthorized(second.body);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns security context fields', async () => {
      const auth = await seedAuthenticatedFixture(app);

      const response = await injectJson(
        app,
        withBearerToken(auth.tokens.accessToken, {
          method: 'GET',
          url: '/api/auth/me',
        }),
      );

      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, {
        personId: auth.personId,
        sessionId: auth.tokens.sessionId,
        tenantId: null,
      });
    });
  });

  describe('POST /api/auth/credentials', () => {
    it('registers a credential for an existing person', async () => {
      const seeded = await seedPersonFixture();

      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: seeded.personId,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        personId?: string;
        status?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.personId, seeded.personId);
      assert.equal(body.status, 'ACTIVE');
    });

    it('returns 409 when credential already exists', async () => {
      const seeded = await seedPersonFixture();

      const first = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: seeded.personId,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: seeded.personId,
          password: 'AnotherP@ss1',
        },
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('returns 404 when person does not exist', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: UNKNOWN_PERSON_ID,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(response.statusCode, 404);
    });

    it('returns 400 for invalid payload', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: 'not-a-uuid',
          password: 'short',
        },
      });

      assert.equal(response.statusCode, 400);
    });

    it('is available outside production by default', async () => {
      const seeded = await seedPersonFixture({
        documentValue: 'CRED001',
      });

      const response = await registerCredentialForPerson(
        app,
        seeded.personId,
        'SecureP@ssw0rd',
      );

      assert.equal(response.statusCode, 201);
    });
  });

  describe('Public routes', () => {
    it('allows GET /health without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      assert.equal(response.statusCode, 200);
    });
  });
});

describe('Auth HTTP routes production configuration (integration)', () => {
  it('blocks credential registration when disabled in production', async () => {
    const app = await createAuthHttpTestAppWithEnv({
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.example.com',
      JWT_SECRET: PRODUCTION_JWT_SECRET,
      AUTH_CREDENTIAL_REGISTRATION_ENABLED: 'false',
    });

    try {
      await resetPersons();

      const seeded = await seedPersonFixture({
        documentValue: 'PROD001',
        email: 'production.user@example.com',
      });

      await seedCredentialInDatabase(seeded.personId, 'SecureP@ssw0rd');

      const unauthenticated = await injectJson(app, {
        method: 'POST',
        url: '/api/auth/credentials',
        payload: {
          personId: seeded.personId,
          password: 'SecureP@ssw0rd',
        },
      });

      assert.equal(unauthenticated.statusCode, 401);
      assertUnauthorized(unauthenticated.body);

      const tokens = await loginWithCredentials(
        app,
        seeded.email,
        'SecureP@ssw0rd',
      );

      const authenticated = await injectJson(
        app,
        withBearerToken(tokens.accessToken, {
          method: 'POST',
          url: '/api/auth/credentials',
          payload: {
            personId: seeded.personId,
            password: 'SecureP@ssw0rd',
          },
        }),
      );

      assert.equal(authenticated.statusCode, 404);
    }
    finally {
      await resetPersons();
      await app.close();
    }
  });
});

describe('Swagger public access (integration)', () => {
  it('allows GET /docs when OpenAPI is enabled', async () => {
    const app = await createAuthHttpTestAppWithEnv({
      OPENAPI_ENABLED: 'true',
    });

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/docs',
      });

      assert.equal(response.statusCode, 200);
    }
    finally {
      await app.close();
    }
  });
});

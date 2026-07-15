import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../../../core/database/prisma-client.js';
import { FORBIDDEN_MESSAGE } from '../../application/authorization/forbidden-response.js';
import { CreatePermissionCommand } from '../../application/create-permission/create-permission.command.js';
import { CreatePermissionHandler } from '../../application/create-permission/create-permission.handler.js';
import { CreateRoleCommand } from '../../application/create-role/create-role.command.js';
import { CreateRoleHandler } from '../../application/create-role/create-role.handler.js';
import { GrantPermissionCommand } from '../../application/grant-permission/grant-permission.command.js';
import { GrantPermissionHandler } from '../../application/grant-permission/grant-permission.handler.js';
import {
  createAuthHttpTestAppWithEnv,
  grantPermissionApiPermissions,
  seedAuthenticatedFixture,
  withBearerToken,
} from '../../../../test-support/auth-http-test.harness.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import {
  createPermissionHttpTestApp,
  injectJson,
  requireDatabaseUrl,
  validCreatePermissionPayload,
} from '../../../../test-support/permission-http-test.harness.js';
import {
  resetRbacFixtures,
  seedTenantOnly,
} from '../../../../test-support/rbac-test.harness.js';
import { PrismaPermissionAssignmentRepository } from '../../infrastructure/repositories/prisma-permission-assignment.repository.js';
import { PrismaPermissionRepository } from '../../infrastructure/repositories/prisma-permission.repository.js';
import { PrismaRoleRepository } from '../../infrastructure/repositories/prisma-role.repository.js';
import { PrismaTenantRepository } from '../../infrastructure/repositories/prisma-tenant.repository.js';

requireDatabaseUrl();

const UNKNOWN_PERMISSION_ID = '550e8400-e29b-41d4-a716-446655440099';
const UNKNOWN_PERMISSION_ASSIGNMENT_ID = '550e8400-e29b-41d4-a716-446655440098';

function assertForbidden(body: unknown) {
  assert.deepEqual(body, {
    statusCode: 403,
    error: 'Forbidden',
    message: FORBIDDEN_MESSAGE,
  });
}

async function seedForeignPermission(name = 'Foreign Permission'): Promise<{
  permissionId: string;
  tenantId: string;
}> {
  const prisma = getPrismaClient();
  const tenantId = await seedTenantOnly(`foreign-permission-${Date.now()}`);
  const permission = await new CreatePermissionHandler(
    new PrismaPermissionRepository(prisma),
    new PrismaTenantRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new CreatePermissionCommand({
      tenantId,
      name,
    }),
  );

  return {
    permissionId: permission.id,
    tenantId,
  };
}

async function seedForeignPermissionAssignment(): Promise<{
  permissionAssignmentId: string;
  roleId: string;
  permissionId: string;
  tenantId: string;
}> {
  const prisma = getPrismaClient();
  const tenantId = await seedTenantOnly(`foreign-perm-assignment-${Date.now()}`);
  const role = await new CreateRoleHandler(
    new PrismaRoleRepository(prisma),
    new PrismaTenantRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new CreateRoleCommand({
      tenantId,
      name: 'Foreign Permission Role',
    }),
  );
  const permission = await new CreatePermissionHandler(
    new PrismaPermissionRepository(prisma),
    new PrismaTenantRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new CreatePermissionCommand({
      tenantId,
      name: 'FOREIGN_READ',
    }),
  );
  const assignment = await new GrantPermissionHandler(
    new PrismaPermissionAssignmentRepository(prisma),
    new PrismaRoleRepository(prisma),
    new PrismaPermissionRepository(prisma),
    noopEventDispatcher,
  ).execute(
    new GrantPermissionCommand({
      roleId: role.id,
      permissionId: permission.id,
    }),
  );

  return {
    permissionAssignmentId: assignment.id,
    roleId: role.id,
    permissionId: permission.id,
    tenantId,
  };
}

describe('Permission HTTP routes (integration)', () => {
  let app: FastifyInstance;
  let accessToken: string;
  let authenticatedPersonId: string;
  let sessionId: string;

  before(async () => {
    app = await createPermissionHttpTestApp();
  });

  beforeEach(async () => {
    await resetRbacFixtures();
    const auth = await seedAuthenticatedFixture(app);
    accessToken = auth.tokens.accessToken;
    authenticatedPersonId = auth.personId;
    sessionId = auth.tokens.sessionId;
  });

  after(async () => {
    await app.close();
  });

  function authorizedInject(
    options: Parameters<typeof injectJson>[1],
  ) {
    return injectJson(app, withBearerToken(accessToken, options));
  }

  async function authorizePermission(
    permissions: Array<
      | 'PERMISSION_READ'
      | 'PERMISSION_CREATE'
      | 'PERMISSION_GRANT'
      | 'PERMISSION_ASSIGNMENT_READ'
      | 'PERMISSION_REVOKE'
    >,
  ): Promise<string> {
    return grantPermissionApiPermissions(
      authenticatedPersonId,
      sessionId,
      permissions,
    );
  }

  async function createRoleInTenant(tenantId: string): Promise<string> {
    const prisma = getPrismaClient();
    const role = await new CreateRoleHandler(
      new PrismaRoleRepository(prisma),
      new PrismaTenantRepository(prisma),
      noopEventDispatcher,
    ).execute(
      new CreateRoleCommand({
        tenantId,
        name: `Grant Target Role ${Date.now()}`,
      }),
    );

    return role.id;
  }

  async function createPermissionViaApi(params: {
    tenantId: string;
    name?: string;
  }): Promise<{ statusCode: number; body: unknown }> {
    return authorizedInject({
      method: 'POST',
      url: '/api/permissions',
      payload: {
        tenantId: params.tenantId,
        name: params.name ?? validCreatePermissionPayload(params.tenantId).name,
      },
    });
  }

  async function createPermissionAssignmentViaApi(params: {
    roleId: string;
    permissionId: string;
  }): Promise<{ statusCode: number; body: unknown }> {
    return authorizedInject({
      method: 'POST',
      url: '/api/permission-assignments',
      payload: {
        roleId: params.roleId,
        permissionId: params.permissionId,
      },
    });
  }

  describe('POST /api/permissions', () => {
    it('creates a permission with 201', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);
      const payload = validCreatePermissionPayload(boundTenantId);

      const response = await createPermissionViaApi({
        tenantId: boundTenantId,
        name: payload.name,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        tenantId?: string;
        name?: string;
        createdAt?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.tenantId, boundTenantId);
      assert.equal(body.name, payload.name);
      assert.ok(body.createdAt);
    });

    it('returns 409 for a duplicate permission name in the same tenant', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);
      const payload = validCreatePermissionPayload(boundTenantId, 'duplicate');

      const first = await createPermissionViaApi({
        tenantId: boundTenantId,
        name: payload.name,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await createPermissionViaApi({
        tenantId: boundTenantId,
        name: payload.name,
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('allows the same permission name in another tenant', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);
      const sharedName = 'SHARED_READ';
      const foreign = await seedForeignPermission(sharedName);

      const response = await createPermissionViaApi({
        tenantId: boundTenantId,
        name: sharedName,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as { tenantId?: string; name?: string };

      assert.equal(body.tenantId, boundTenantId);
      assert.equal(body.name, sharedName);
      assert.notEqual(foreign.tenantId, boundTenantId);
    });

    it('returns 400 for an invalid payload', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);

      const response = await authorizedInject({
        method: 'POST',
        url: '/api/permissions',
        payload: {
          tenantId: boundTenantId,
          name: 'A',
        },
      });

      assert.equal(response.statusCode, 400);
    });

    it('returns 403 for POST on a foreign tenant id', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);
      const foreignTenantId = await seedTenantOnly(`post-foreign-${Date.now()}`);
      const prisma = getPrismaClient();
      const beforeCount = await prisma.permission.count();

      assert.notEqual(foreignTenantId, boundTenantId);

      const response = await createPermissionViaApi({
        tenantId: foreignTenantId,
        name: 'FOREIGN_CREATE',
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);

      const afterCount = await prisma.permission.count();
      assert.equal(afterCount, beforeCount);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/permissions',
        payload: validCreatePermissionPayload(UNKNOWN_PERMISSION_ID),
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without PERMISSION_CREATE', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_READ']);

      const response = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('GET /api/permissions/:id', () => {
    it('returns own-tenant permission with 200', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_READ',
        'PERMISSION_CREATE',
      ]);

      const created = await createPermissionViaApi({ tenantId: boundTenantId });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permissions/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; tenantId?: string };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.tenantId, boundTenantId);
    });

    it('returns 403 for a foreign permission id', async () => {
      await authorizePermission(['PERMISSION_READ']);
      const foreign = await seedForeignPermission();

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permissions/${foreign.permissionId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for an unknown permission id without revealing existence', async () => {
      await authorizePermission(['PERMISSION_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permissions/${UNKNOWN_PERMISSION_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/permissions/${UNKNOWN_PERMISSION_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without PERMISSION_READ', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);

      const created = await createPermissionViaApi({ tenantId: boundTenantId });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permissions/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('POST /api/permission-assignments', () => {
    it('creates a permission assignment with 201', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const response = await createPermissionAssignmentViaApi({
        roleId,
        permissionId: (createdPermission.body as { id: string }).id,
      });

      assert.equal(response.statusCode, 201);

      const body = response.body as {
        id?: string;
        roleId?: string;
        permissionId?: string;
        status?: string;
      };

      assert.match(body.id ?? '', /^[0-9a-f-]{36}$/i);
      assert.equal(body.roleId, roleId);
      assert.equal(
        body.permissionId,
        (createdPermission.body as { id: string }).id,
      );
      assert.equal(body.status, 'ACTIVE');
    });

    it('reactivates a revoked permission assignment with 200', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
        'PERMISSION_REVOKE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const permissionId = (createdPermission.body as { id: string }).id;

      const created = await createPermissionAssignmentViaApi({
        roleId,
        permissionId,
      });

      assert.equal(created.statusCode, 201);

      const revoked = await authorizedInject({
        method: 'DELETE',
        url: `/api/permission-assignments/${roleId}/${permissionId}`,
      });

      assert.equal(revoked.statusCode, 200);

      const reactivated = await createPermissionAssignmentViaApi({
        roleId,
        permissionId,
      });

      assert.equal(reactivated.statusCode, 200);

      const body = reactivated.body as {
        id?: string;
        status?: string;
        reactivatedAt?: string | null;
      };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.status, 'ACTIVE');
      assert.ok(body.reactivatedAt);
    });

    it('returns 409 for an active duplicate permission assignment', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const permissionId = (createdPermission.body as { id: string }).id;

      const first = await createPermissionAssignmentViaApi({
        roleId,
        permissionId,
      });

      assert.equal(first.statusCode, 201);

      const duplicate = await createPermissionAssignmentViaApi({
        roleId,
        permissionId,
      });

      assert.equal(duplicate.statusCode, 409);
    });

    it('returns 403 for a cross-tenant permission assignment', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_GRANT']);
      const roleId = await createRoleInTenant(boundTenantId);
      const foreign = await seedForeignPermission();
      const prisma = getPrismaClient();
      const beforeCount = await prisma.permissionAssignment.count();

      const response = await createPermissionAssignmentViaApi({
        roleId,
        permissionId: foreign.permissionId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);

      const afterCount = await prisma.permissionAssignment.count();
      assert.equal(afterCount, beforeCount);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'POST',
        url: '/api/permission-assignments',
        payload: {
          roleId: UNKNOWN_PERMISSION_ASSIGNMENT_ID,
          permissionId: UNKNOWN_PERMISSION_ID,
        },
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without PERMISSION_GRANT', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const response = await createPermissionAssignmentViaApi({
        roleId,
        permissionId: (createdPermission.body as { id: string }).id,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('GET /api/permission-assignments/:id', () => {
    it('returns own-tenant permission assignment with 200', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
        'PERMISSION_ASSIGNMENT_READ',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const created = await createPermissionAssignmentViaApi({
        roleId,
        permissionId: (createdPermission.body as { id: string }).id,
      });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permission-assignments/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { id?: string; roleId?: string };

      assert.equal(body.id, (created.body as { id: string }).id);
      assert.equal(body.roleId, roleId);
    });

    it('returns 403 for a foreign permission assignment id', async () => {
      await authorizePermission(['PERMISSION_ASSIGNMENT_READ']);
      const foreign = await seedForeignPermissionAssignment();

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permission-assignments/${foreign.permissionAssignmentId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 403 for an unknown permission assignment id without revealing existence', async () => {
      await authorizePermission(['PERMISSION_ASSIGNMENT_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permission-assignments/${UNKNOWN_PERMISSION_ASSIGNMENT_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'GET',
        url: `/api/permission-assignments/${UNKNOWN_PERMISSION_ASSIGNMENT_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without PERMISSION_ASSIGNMENT_READ', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const created = await createPermissionAssignmentViaApi({
        roleId,
        permissionId: (createdPermission.body as { id: string }).id,
      });

      assert.equal(created.statusCode, 201);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permission-assignments/${(created.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('DELETE /api/permission-assignments/:roleId/:permissionId', () => {
    it('revokes own-tenant permission assignment with 200', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
        'PERMISSION_REVOKE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const permissionId = (createdPermission.body as { id: string }).id;

      await createPermissionAssignmentViaApi({
        roleId,
        permissionId,
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/permission-assignments/${roleId}/${permissionId}`,
      });

      assert.equal(response.statusCode, 200);

      const body = response.body as { status?: string };

      assert.equal(body.status, 'REMOVED');
    });

    it('returns 200 for idempotent revoke on an already removed assignment', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
        'PERMISSION_REVOKE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const permissionId = (createdPermission.body as { id: string }).id;

      await createPermissionAssignmentViaApi({
        roleId,
        permissionId,
      });

      const first = await authorizedInject({
        method: 'DELETE',
        url: `/api/permission-assignments/${roleId}/${permissionId}`,
      });

      assert.equal(first.statusCode, 200);

      const second = await authorizedInject({
        method: 'DELETE',
        url: `/api/permission-assignments/${roleId}/${permissionId}`,
      });

      assert.equal(second.statusCode, 200);

      const body = second.body as { status?: string };

      assert.equal(body.status, 'REMOVED');
    });

    it('returns 403 for DELETE on a foreign tenant scope', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_REVOKE']);
      const foreign = await seedForeignPermissionAssignment();

      assert.notEqual(foreign.tenantId, boundTenantId);

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/permission-assignments/${foreign.roleId}/${foreign.permissionId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });

    it('returns 404 for missing permission assignment in the bound tenant', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_REVOKE',
        'PERMISSION_CREATE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/permission-assignments/${roleId}/${(createdPermission.body as { id: string }).id}`,
      });

      assert.equal(response.statusCode, 404);
    });

    it('returns 401 without bearer token', async () => {
      const response = await injectJson(app, {
        method: 'DELETE',
        url: `/api/permission-assignments/${UNKNOWN_PERMISSION_ASSIGNMENT_ID}/${UNKNOWN_PERMISSION_ID}`,
      });

      assert.equal(response.statusCode, 401);
    });

    it('returns 403 without PERMISSION_REVOKE', async () => {
      const boundTenantId = await authorizePermission([
        'PERMISSION_GRANT',
        'PERMISSION_CREATE',
      ]);
      const roleId = await createRoleInTenant(boundTenantId);
      const createdPermission = await createPermissionViaApi({
        tenantId: boundTenantId,
      });

      assert.equal(createdPermission.statusCode, 201);

      const permissionId = (createdPermission.body as { id: string }).id;

      await createPermissionAssignmentViaApi({
        roleId,
        permissionId,
      });

      const response = await authorizedInject({
        method: 'DELETE',
        url: `/api/permission-assignments/${roleId}/${permissionId}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
    });
  });

  describe('Authorization scope prevents handler execution', () => {
    it('does not run GET handler when permission scope resolution fails', async () => {
      await authorizePermission(['PERMISSION_READ']);

      const response = await authorizedInject({
        method: 'GET',
        url: `/api/permissions/${UNKNOWN_PERMISSION_ID}`,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
      assert.notEqual(
        (response.body as { statusCode?: number }).statusCode,
        404,
      );
    });

    it('does not run POST handler when tenant scope mismatches', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_CREATE']);
      const foreignTenantId = await seedTenantOnly(`scope-${Date.now()}`);
      const prisma = getPrismaClient();
      const beforeCount = await prisma.permission.count({
        where: { tenantId: foreignTenantId },
      });

      const response = await createPermissionViaApi({
        tenantId: foreignTenantId,
        name: 'SCOPED_FOREIGN',
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);
      assert.notEqual(foreignTenantId, boundTenantId);

      const afterCount = await prisma.permission.count({
        where: { tenantId: foreignTenantId },
      });

      assert.equal(afterCount, beforeCount);
    });

    it('does not run POST assignment handler when scope refs mismatch', async () => {
      const boundTenantId = await authorizePermission(['PERMISSION_GRANT']);
      const roleId = await createRoleInTenant(boundTenantId);
      const foreign = await seedForeignPermission();
      const prisma = getPrismaClient();
      const beforeCount = await prisma.permissionAssignment.count({
        where: {
          roleId,
          permissionId: foreign.permissionId,
        },
      });

      const response = await createPermissionAssignmentViaApi({
        roleId,
        permissionId: foreign.permissionId,
      });

      assert.equal(response.statusCode, 403);
      assertForbidden(response.body);

      const afterCount = await prisma.permissionAssignment.count({
        where: {
          roleId,
          permissionId: foreign.permissionId,
        },
      });

      assert.equal(afterCount, beforeCount);
    });
  });
});

describe('Permission HTTP OpenAPI (integration)', () => {
  it('documents permission endpoints with security and response codes', async () => {
    const app = await createAuthHttpTestAppWithEnv({
      OPENAPI_ENABLED: 'true',
    });

    try {
      const response = await injectJson(app, {
        method: 'GET',
        url: '/docs/json',
      });

      assert.equal(response.statusCode, 200);

      const spec = response.body as {
        paths?: Record<string, Record<string, {
          responses?: Record<string, unknown>;
          security?: unknown[];
        }>>;
      };

      const permissionPost = spec.paths?.['/api/permissions']?.post;
      const permissionGet = spec.paths?.['/api/permissions/{id}']?.get;
      const assignmentPost = spec.paths?.['/api/permission-assignments']?.post;
      const assignmentGet =
        spec.paths?.['/api/permission-assignments/{id}']?.get;
      const assignmentDelete =
        spec.paths?.['/api/permission-assignments/{roleId}/{permissionId}']?.delete;

      assert.ok(permissionPost);
      assert.ok(permissionGet);
      assert.ok(assignmentPost);
      assert.ok(assignmentGet);
      assert.ok(assignmentDelete);

      assert.ok('201' in (permissionPost?.responses ?? {}));
      assert.ok('409' in (permissionPost?.responses ?? {}));
      assert.ok('403' in (permissionPost?.responses ?? {}));
      assert.ok('401' in (permissionPost?.responses ?? {}));

      assert.ok('200' in (permissionGet?.responses ?? {}));
      assert.ok('403' in (permissionGet?.responses ?? {}));
      assert.ok('401' in (permissionGet?.responses ?? {}));
      assert.equal('404' in (permissionGet?.responses ?? {}), false);

      assert.ok('201' in (assignmentPost?.responses ?? {}));
      assert.ok('200' in (assignmentPost?.responses ?? {}));
      assert.ok('409' in (assignmentPost?.responses ?? {}));
      assert.ok('403' in (assignmentPost?.responses ?? {}));
      assert.ok('401' in (assignmentPost?.responses ?? {}));

      assert.ok('200' in (assignmentGet?.responses ?? {}));
      assert.ok('403' in (assignmentGet?.responses ?? {}));
      assert.ok('401' in (assignmentGet?.responses ?? {}));
      assert.equal('404' in (assignmentGet?.responses ?? {}), false);

      assert.ok('200' in (assignmentDelete?.responses ?? {}));
      assert.ok('404' in (assignmentDelete?.responses ?? {}));
      assert.ok('403' in (assignmentDelete?.responses ?? {}));
      assert.ok('401' in (assignmentDelete?.responses ?? {}));

      assert.deepEqual(permissionPost?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(permissionGet?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(assignmentPost?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(assignmentGet?.security, [{ bearerAuth: [] }]);
      assert.deepEqual(assignmentDelete?.security, [{ bearerAuth: [] }]);
    }
    finally {
      await app.close();
    }
  });
});

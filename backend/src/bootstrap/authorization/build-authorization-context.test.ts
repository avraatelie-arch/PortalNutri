import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from '../../modules/iam/application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../modules/iam/application/authorization/authorization-resource.js';
import { buildAuthorizationContext } from './build-authorization-context.js';

function createRequest(overrides: Record<string, unknown> = {}) {
  return {
    securityContext: {
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: null,
    },
    params: {
      id: 'person-a',
    },
    ...overrides,
  } as Parameters<typeof buildAuthorizationContext>[0];
}

describe('buildAuthorizationContext', () => {
  it('builds context for authenticated-only routes', () => {
    const context = buildAuthorizationContext(createRequest(), {
      authenticatedOnly: true,
    });

    assert.deepEqual(context, {
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: null,
      resource: AuthorizationResource.PERSON,
      action: AuthorizationAction.EXECUTE,
      resourceId: null,
      scopeTenantId: null,
      resourceTenantId: null,
    });
  });

  it('builds context for resource routes', () => {
    const context = buildAuthorizationContext(createRequest(), {
      resource: AuthorizationResource.PERSON,
      action: AuthorizationAction.READ,
      resourceIdParam: 'id',
    });

    assert.deepEqual(context, {
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: null,
      resource: AuthorizationResource.PERSON,
      action: AuthorizationAction.READ,
      resourceId: 'person-a',
      scopeTenantId: null,
      resourceTenantId: null,
    });
  });

  it('returns null for malformed security context', () => {
    const context = buildAuthorizationContext(
      createRequest({ securityContext: null }),
      {
        authenticatedOnly: true,
      },
    );

    assert.equal(context, null);
  });

  it('returns null when required resource id param is missing', () => {
    const context = buildAuthorizationContext(
      createRequest({ params: {} }),
      {
        resource: AuthorizationResource.PERSON,
        action: AuthorizationAction.READ,
        resourceIdParam: 'id',
      },
    );

    assert.equal(context, null);
  });

  it('extracts scope tenant id from request body', () => {
    const context = buildAuthorizationContext(
      createRequest({
        body: {
          personId: 'person-b',
          tenantId: 'tenant-b',
        },
      }),
      {
        resource: AuthorizationResource.MEMBERSHIP,
        action: AuthorizationAction.CREATE,
        scopeTenantIdFromBody: 'tenantId',
      },
    );

    assert.deepEqual(context, {
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: null,
      resource: AuthorizationResource.MEMBERSHIP,
      action: AuthorizationAction.CREATE,
      resourceId: null,
      scopeTenantId: 'tenant-b',
      resourceTenantId: null,
    });
  });

  it('extracts scope tenant id from route params', () => {
    const context = buildAuthorizationContext(
      createRequest({
        params: {
          personId: 'person-b',
          tenantId: 'tenant-b',
        },
      }),
      {
        resource: AuthorizationResource.MEMBERSHIP,
        action: AuthorizationAction.DELETE,
        scopeTenantIdFromParam: 'tenantId',
      },
    );

    assert.deepEqual(context, {
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: null,
      resource: AuthorizationResource.MEMBERSHIP,
      action: AuthorizationAction.DELETE,
      resourceId: null,
      scopeTenantId: 'tenant-b',
      resourceTenantId: null,
    });
  });

  it('returns null when required scope tenant body field is missing', () => {
    const context = buildAuthorizationContext(
      createRequest({ body: { personId: 'person-b' } }),
      {
        resource: AuthorizationResource.MEMBERSHIP,
        action: AuthorizationAction.CREATE,
        scopeTenantIdFromBody: 'tenantId',
      },
    );

    assert.equal(context, null);
  });
});

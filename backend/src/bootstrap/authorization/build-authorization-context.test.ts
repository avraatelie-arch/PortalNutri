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
});

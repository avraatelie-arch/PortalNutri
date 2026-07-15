import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from './authorization-action.js';
import type { AuthorizationContext } from './authorization-context.js';
import {
  AuthorizationPermissionKey,
  resolveAuthorizationPermissionKey,
} from './authorization-permission-key.js';
import { AuthorizationResource } from './authorization-resource.js';

function createContext(
  overrides: Partial<AuthorizationContext> = {},
): AuthorizationContext {
  return {
    personId: 'person-a',
    sessionId: 'session-a',
    tenantId: 'tenant-a',
    resource: AuthorizationResource.PERSON,
    action: AuthorizationAction.READ,
    resourceId: 'person-a',
    ...overrides,
  };
}

describe('resolveAuthorizationPermissionKey', () => {
  it('maps PERSON actions to permission keys', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({ action: AuthorizationAction.READ }),
      ),
      AuthorizationPermissionKey.PERSON_READ,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({ action: AuthorizationAction.CREATE }),
      ),
      AuthorizationPermissionKey.PERSON_CREATE,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({ action: AuthorizationAction.UPDATE }),
      ),
      AuthorizationPermissionKey.PERSON_UPDATE,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({ action: AuthorizationAction.DELETE }),
      ),
      AuthorizationPermissionKey.PERSON_DELETE,
    );
  });

  it('returns null for EXECUTE and unknown resources', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({ action: AuthorizationAction.EXECUTE }),
      ),
      null,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: 'OTHER' as AuthorizationResource,
        }),
      ),
      null,
    );
  });
});

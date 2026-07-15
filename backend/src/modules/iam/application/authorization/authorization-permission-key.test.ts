import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from './authorization-action.js';
import { createEmptyAuthorizationContext } from './authorization-context.js';
import {
  AuthorizationPermissionKey,
  resolveAuthorizationPermissionKey,
} from './authorization-permission-key.js';
import { AuthorizationResource } from './authorization-resource.js';

function createContext(
  overrides: Partial<ReturnType<typeof createEmptyAuthorizationContext>> = {},
) {
  return createEmptyAuthorizationContext({
    personId: 'person-a',
    sessionId: 'session-a',
    tenantId: 'tenant-a',
    resource: AuthorizationResource.PERSON,
    action: AuthorizationAction.READ,
    resourceId: 'person-a',
    ...overrides,
  });
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

  it('maps TENANT actions to permission keys', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.READ,
        }),
      ),
      AuthorizationPermissionKey.TENANT_READ,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.CREATE,
        }),
      ),
      AuthorizationPermissionKey.TENANT_CREATE,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.UPDATE,
        }),
      ),
      AuthorizationPermissionKey.TENANT_UPDATE,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.TENANT,
          action: AuthorizationAction.DELETE,
        }),
      ),
      null,
    );
  });

  it('maps MEMBERSHIP actions to permission keys', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.MEMBERSHIP,
          action: AuthorizationAction.READ,
        }),
      ),
      AuthorizationPermissionKey.MEMBERSHIP_READ,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.MEMBERSHIP,
          action: AuthorizationAction.CREATE,
        }),
      ),
      AuthorizationPermissionKey.MEMBERSHIP_CREATE,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.MEMBERSHIP,
          action: AuthorizationAction.DELETE,
        }),
      ),
      AuthorizationPermissionKey.MEMBERSHIP_DELETE,
    );
  });

  it('maps ROLE actions to permission keys', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.ROLE,
          action: AuthorizationAction.READ,
        }),
      ),
      AuthorizationPermissionKey.ROLE_READ,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.ROLE,
          action: AuthorizationAction.CREATE,
        }),
      ),
      AuthorizationPermissionKey.ROLE_CREATE,
    );
  });

  it('maps ROLE_ASSIGNMENT actions to permission keys', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.ROLE_ASSIGNMENT,
          action: AuthorizationAction.CREATE,
        }),
      ),
      AuthorizationPermissionKey.ROLE_ASSIGN,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.ROLE_ASSIGNMENT,
          action: AuthorizationAction.READ,
        }),
      ),
      AuthorizationPermissionKey.ROLE_ASSIGNMENT_READ,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.ROLE_ASSIGNMENT,
          action: AuthorizationAction.DELETE,
        }),
      ),
      AuthorizationPermissionKey.ROLE_REMOVE,
    );
  });

  it('maps PERMISSION actions to permission keys', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.PERMISSION,
          action: AuthorizationAction.READ,
        }),
      ),
      AuthorizationPermissionKey.PERMISSION_READ,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.PERMISSION,
          action: AuthorizationAction.CREATE,
        }),
      ),
      AuthorizationPermissionKey.PERMISSION_CREATE,
    );
  });

  it('maps PERMISSION_ASSIGNMENT actions to permission keys', () => {
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.PERMISSION_ASSIGNMENT,
          action: AuthorizationAction.CREATE,
        }),
      ),
      AuthorizationPermissionKey.PERMISSION_GRANT,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.PERMISSION_ASSIGNMENT,
          action: AuthorizationAction.READ,
        }),
      ),
      AuthorizationPermissionKey.PERMISSION_ASSIGNMENT_READ,
    );
    assert.equal(
      resolveAuthorizationPermissionKey(
        createContext({
          resource: AuthorizationResource.PERMISSION_ASSIGNMENT,
          action: AuthorizationAction.DELETE,
        }),
      ),
      AuthorizationPermissionKey.PERMISSION_REVOKE,
    );
  });
});

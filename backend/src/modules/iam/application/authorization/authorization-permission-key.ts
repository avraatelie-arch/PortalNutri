import { PermissionName } from '../../domain/value-objects/permission-name.js';
import { AuthorizationAction } from './authorization-action.js';
import type { AuthorizationContext } from './authorization-context.js';
import { AuthorizationResource } from './authorization-resource.js';

export const AuthorizationPermissionKey = {
  PERSON_READ: PermissionName.create('PERSON_READ').normalizedValue,
  PERSON_CREATE: PermissionName.create('PERSON_CREATE').normalizedValue,
  PERSON_UPDATE: PermissionName.create('PERSON_UPDATE').normalizedValue,
  PERSON_DELETE: PermissionName.create('PERSON_DELETE').normalizedValue,
  TENANT_READ: PermissionName.create('TENANT_READ').normalizedValue,
  TENANT_CREATE: PermissionName.create('TENANT_CREATE').normalizedValue,
  TENANT_UPDATE: PermissionName.create('TENANT_UPDATE').normalizedValue,
  MEMBERSHIP_READ: PermissionName.create('MEMBERSHIP_READ').normalizedValue,
  MEMBERSHIP_CREATE: PermissionName.create('MEMBERSHIP_CREATE').normalizedValue,
  MEMBERSHIP_DELETE: PermissionName.create('MEMBERSHIP_DELETE').normalizedValue,
  ROLE_READ: PermissionName.create('ROLE_READ').normalizedValue,
  ROLE_CREATE: PermissionName.create('ROLE_CREATE').normalizedValue,
  ROLE_ASSIGN: PermissionName.create('ROLE_ASSIGN').normalizedValue,
  ROLE_ASSIGNMENT_READ: PermissionName.create('ROLE_ASSIGNMENT_READ').normalizedValue,
  ROLE_REMOVE: PermissionName.create('ROLE_REMOVE').normalizedValue,
  PERMISSION_READ: PermissionName.create('PERMISSION_READ').normalizedValue,
  PERMISSION_CREATE: PermissionName.create('PERMISSION_CREATE').normalizedValue,
  PERMISSION_GRANT: PermissionName.create('PERMISSION_GRANT').normalizedValue,
  PERMISSION_ASSIGNMENT_READ: PermissionName.create('PERMISSION_ASSIGNMENT_READ').normalizedValue,
  PERMISSION_REVOKE: PermissionName.create('PERMISSION_REVOKE').normalizedValue,
} as const;

export function resolveAuthorizationPermissionKey(
  context: AuthorizationContext,
): string | null {
  if (context.resource === AuthorizationResource.PERSON) {
    switch (context.action) {
      case AuthorizationAction.READ:
        return AuthorizationPermissionKey.PERSON_READ;
      case AuthorizationAction.CREATE:
        return AuthorizationPermissionKey.PERSON_CREATE;
      case AuthorizationAction.UPDATE:
        return AuthorizationPermissionKey.PERSON_UPDATE;
      case AuthorizationAction.DELETE:
        return AuthorizationPermissionKey.PERSON_DELETE;
      default:
        return null;
    }
  }

  if (context.resource === AuthorizationResource.TENANT) {
    switch (context.action) {
      case AuthorizationAction.READ:
        return AuthorizationPermissionKey.TENANT_READ;
      case AuthorizationAction.CREATE:
        return AuthorizationPermissionKey.TENANT_CREATE;
      case AuthorizationAction.UPDATE:
        return AuthorizationPermissionKey.TENANT_UPDATE;
      default:
        return null;
    }
  }

  if (context.resource === AuthorizationResource.MEMBERSHIP) {
    switch (context.action) {
      case AuthorizationAction.READ:
        return AuthorizationPermissionKey.MEMBERSHIP_READ;
      case AuthorizationAction.CREATE:
        return AuthorizationPermissionKey.MEMBERSHIP_CREATE;
      case AuthorizationAction.DELETE:
        return AuthorizationPermissionKey.MEMBERSHIP_DELETE;
      default:
        return null;
    }
  }

  if (context.resource === AuthorizationResource.ROLE) {
    switch (context.action) {
      case AuthorizationAction.READ:
        return AuthorizationPermissionKey.ROLE_READ;
      case AuthorizationAction.CREATE:
        return AuthorizationPermissionKey.ROLE_CREATE;
      default:
        return null;
    }
  }

  if (context.resource === AuthorizationResource.ROLE_ASSIGNMENT) {
    switch (context.action) {
      case AuthorizationAction.CREATE:
        return AuthorizationPermissionKey.ROLE_ASSIGN;
      case AuthorizationAction.READ:
        return AuthorizationPermissionKey.ROLE_ASSIGNMENT_READ;
      case AuthorizationAction.DELETE:
        return AuthorizationPermissionKey.ROLE_REMOVE;
      default:
        return null;
    }
  }

  if (context.resource === AuthorizationResource.PERMISSION) {
    switch (context.action) {
      case AuthorizationAction.READ:
        return AuthorizationPermissionKey.PERMISSION_READ;
      case AuthorizationAction.CREATE:
        return AuthorizationPermissionKey.PERMISSION_CREATE;
      default:
        return null;
    }
  }

  if (context.resource === AuthorizationResource.PERMISSION_ASSIGNMENT) {
    switch (context.action) {
      case AuthorizationAction.CREATE:
        return AuthorizationPermissionKey.PERMISSION_GRANT;
      case AuthorizationAction.READ:
        return AuthorizationPermissionKey.PERMISSION_ASSIGNMENT_READ;
      case AuthorizationAction.DELETE:
        return AuthorizationPermissionKey.PERMISSION_REVOKE;
      default:
        return null;
    }
  }

  return null;
}

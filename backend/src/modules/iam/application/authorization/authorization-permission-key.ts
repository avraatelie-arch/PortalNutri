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

  return null;
}

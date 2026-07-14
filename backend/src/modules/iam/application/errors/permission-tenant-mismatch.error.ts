import { ApplicationError } from './application-error.js';

export class PermissionTenantMismatchError extends ApplicationError {
  readonly code = 'PERMISSION_TENANT_MISMATCH' as const;

  constructor(
    readonly roleId: string,
    readonly permissionId: string,
    readonly roleTenantId: string,
    readonly permissionTenantId: string,
  ) {
    super(
      `Permission "${permissionId}" belongs to tenant "${permissionTenantId}" and cannot be granted to role "${roleId}" in tenant "${roleTenantId}".`,
    );
    this.name = 'PermissionTenantMismatchError';
  }
}

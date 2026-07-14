import { ApplicationError } from './application-error.js';

export class RoleTenantMismatchError extends ApplicationError {
  readonly code = 'ROLE_TENANT_MISMATCH' as const;

  constructor(
    readonly membershipId: string,
    readonly roleId: string,
    readonly membershipTenantId: string,
    readonly roleTenantId: string,
  ) {
    super(
      `Role "${roleId}" belongs to tenant "${roleTenantId}" and cannot be assigned to membership "${membershipId}" in tenant "${membershipTenantId}".`,
    );
    this.name = 'RoleTenantMismatchError';
  }
}

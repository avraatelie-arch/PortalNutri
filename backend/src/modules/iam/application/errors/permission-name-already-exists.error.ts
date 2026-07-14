import { ApplicationError } from './application-error.js';

export class PermissionNameAlreadyExistsError extends ApplicationError {
  readonly code = 'PERMISSION_NAME_ALREADY_EXISTS' as const;

  constructor(
    readonly tenantId: string,
    readonly name: string,
  ) {
    super(`Permission name "${name}" already exists for tenant "${tenantId}".`);
    this.name = 'PermissionNameAlreadyExistsError';
  }
}

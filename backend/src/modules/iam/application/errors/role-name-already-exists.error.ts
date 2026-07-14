import { ApplicationError } from './application-error.js';

export class RoleNameAlreadyExistsError extends ApplicationError {
  readonly code = 'ROLE_NAME_ALREADY_EXISTS' as const;

  constructor(
    readonly tenantId: string,
    readonly name: string,
  ) {
    super(`Role name "${name}" already exists for tenant "${tenantId}".`);
    this.name = 'RoleNameAlreadyExistsError';
  }
}

import { ApplicationError } from './application-error.js';

export class RoleNotFoundError extends ApplicationError {
  readonly code = 'ROLE_NOT_FOUND' as const;

  constructor(readonly roleId: string) {
    super(`Role with id "${roleId}" was not found.`);
    this.name = 'RoleNotFoundError';
  }
}

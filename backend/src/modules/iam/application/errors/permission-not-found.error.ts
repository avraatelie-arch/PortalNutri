import { ApplicationError } from './application-error.js';

export class PermissionNotFoundError extends ApplicationError {
  readonly code = 'PERMISSION_NOT_FOUND' as const;

  constructor(readonly permissionId: string) {
    super(`Permission with id "${permissionId}" was not found.`);
    this.name = 'PermissionNotFoundError';
  }
}

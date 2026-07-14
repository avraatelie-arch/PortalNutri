import { ApplicationError } from './application-error.js';

export class TenantSlugAlreadyExistsError extends ApplicationError {
  readonly code = 'TENANT_SLUG_ALREADY_EXISTS' as const;

  constructor(readonly slug: string) {
    super(`Tenant slug "${slug}" is already registered.`);
    this.name = 'TenantSlugAlreadyExistsError';
  }
}

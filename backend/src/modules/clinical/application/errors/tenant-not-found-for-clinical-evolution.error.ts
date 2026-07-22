import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantNotFoundForClinicalEvolutionError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND_FOR_CLINICAL_EVOLUTION' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" was not found.`);
    this.name = 'TenantNotFoundForClinicalEvolutionError';
  }
}

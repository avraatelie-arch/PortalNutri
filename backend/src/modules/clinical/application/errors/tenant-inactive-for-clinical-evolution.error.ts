import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForClinicalEvolutionError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_CLINICAL_EVOLUTION' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" is not active.`);
    this.name = 'TenantInactiveForClinicalEvolutionError';
  }
}

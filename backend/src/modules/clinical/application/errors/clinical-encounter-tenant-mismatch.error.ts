import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterTenantMismatchError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_TENANT_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly resourceType: string,
    readonly resourceId: string,
  ) {
    super(
      `${resourceType} "${resourceId}" does not belong to tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterTenantMismatchError';
  }
}

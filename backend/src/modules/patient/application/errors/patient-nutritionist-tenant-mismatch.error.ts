import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNutritionistTenantMismatchError extends ApplicationError {
  readonly code = 'PATIENT_NUTRITIONIST_TENANT_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly resourceType: 'patient' | 'nutritionist' | 'assignment',
    readonly resourceId: string,
  ) {
    super(
      `${resourceType} "${resourceId}" does not belong to tenant "${tenantId}".`,
    );
    this.name = 'PatientNutritionistTenantMismatchError';
  }
}

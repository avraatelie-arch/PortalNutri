import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveForAnthropometryError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE_FOR_ANTHROPOMETRY' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
  ) {
    super(
      `Patient with id "${patientId}" must be ACTIVE for tenant "${tenantId}".`,
    );
    this.name = 'PatientInactiveForAnthropometryError';
  }
}

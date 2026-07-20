import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveForBodyCompositionError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
  ) {
    super(
      `Patient "${patientId}" is inactive for tenant "${tenantId}".`,
    );
    this.name = 'PatientInactiveForBodyCompositionError';
  }
}

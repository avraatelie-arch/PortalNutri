import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNotFoundForBodyCompositionError extends ApplicationError {
  readonly code = 'PATIENT_NOT_FOUND_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
  ) {
    super(
      `Patient "${patientId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'PatientNotFoundForBodyCompositionError';
  }
}

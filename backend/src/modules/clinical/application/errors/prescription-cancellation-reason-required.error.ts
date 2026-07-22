import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionCancellationReasonRequiredError extends ApplicationError {
  readonly code = 'PRESCRIPTION_CANCELLATION_REASON_REQUIRED' as const;

  constructor(readonly tenantId: string, readonly prescriptionId: string) {
    super(
      `Cancellation reason is required for issued prescription with id "${prescriptionId}" in tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionCancellationReasonRequiredError';
  }
}

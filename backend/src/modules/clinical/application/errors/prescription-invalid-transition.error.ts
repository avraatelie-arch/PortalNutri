import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionInvalidTransitionError extends ApplicationError {
  readonly code = 'PRESCRIPTION_INVALID_TRANSITION' as const;

  constructor(readonly tenantId: string, readonly prescriptionId: string) {
    super(
      `Invalid lifecycle transition for prescription with id "${prescriptionId}" in tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionInvalidTransitionError';
  }
}

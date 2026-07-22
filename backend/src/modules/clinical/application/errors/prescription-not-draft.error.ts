import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionNotDraftError extends ApplicationError {
  readonly code = 'PRESCRIPTION_NOT_DRAFT' as const;

  constructor(readonly tenantId: string, readonly prescriptionId: string) {
    super(
      `Prescription with id "${prescriptionId}" is not in DRAFT status for tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionNotDraftError';
  }
}

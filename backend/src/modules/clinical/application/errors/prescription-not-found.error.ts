import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionNotFoundError extends ApplicationError {
  readonly code = 'PRESCRIPTION_NOT_FOUND' as const;

  constructor(readonly tenantId: string, readonly prescriptionId: string) {
    super(
      `Prescription with id "${prescriptionId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionNotFoundError';
  }
}

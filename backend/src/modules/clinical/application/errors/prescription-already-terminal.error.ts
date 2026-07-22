import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionAlreadyTerminalError extends ApplicationError {
  readonly code = 'PRESCRIPTION_ALREADY_TERMINAL' as const;

  constructor(readonly tenantId: string, readonly prescriptionId: string) {
    super(
      `Prescription with id "${prescriptionId}" is in a terminal status for tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionAlreadyTerminalError';
  }
}

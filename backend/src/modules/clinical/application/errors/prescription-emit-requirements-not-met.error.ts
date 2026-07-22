import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionEmitRequirementsNotMetError extends ApplicationError {
  readonly code = 'PRESCRIPTION_EMIT_REQUIREMENTS_NOT_MET' as const;

  constructor(readonly tenantId: string, readonly prescriptionId: string) {
    super(
      `Prescription with id "${prescriptionId}" does not meet emit requirements for tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionEmitRequirementsNotMetError';
  }
}

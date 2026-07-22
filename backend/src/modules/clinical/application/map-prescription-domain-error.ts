import { PrescriptionEmitRequirementsNotMetDomainError } from '../domain/errors/prescription-emit-requirements-not-met.domain-error.js';
import { PrescriptionCancellationReasonRequiredDomainError } from '../domain/errors/prescription-cancellation-reason-required.domain-error.js';
import { PrescriptionInvalidTransitionDomainError } from '../domain/errors/prescription-invalid-transition.domain-error.js';
import { PrescriptionTerminalDomainError } from '../domain/errors/prescription-terminal.domain-error.js';
import { PrescriptionEmitRequirementsNotMetError } from './errors/prescription-emit-requirements-not-met.error.js';
import { PrescriptionAlreadyTerminalError } from './errors/prescription-already-terminal.error.js';
import { PrescriptionCancellationReasonRequiredError } from './errors/prescription-cancellation-reason-required.error.js';
import { PrescriptionInvalidTransitionError } from './errors/prescription-invalid-transition.error.js';
import { PrescriptionNotDraftError } from './errors/prescription-not-draft.error.js';

export type PrescriptionMutationAction =
  | 'emit'
  | 'cancel'
  | 'edit'
  | 'changeResponsibleNutritionist';

export function mapPrescriptionDomainError(
  tenantId: string,
  prescriptionId: string,
  action: PrescriptionMutationAction,
  error: unknown,
): never {
  if (error instanceof PrescriptionTerminalDomainError) {
    throw new PrescriptionAlreadyTerminalError(tenantId, prescriptionId);
  }

  if (error instanceof PrescriptionEmitRequirementsNotMetDomainError) {
    throw new PrescriptionEmitRequirementsNotMetError(tenantId, prescriptionId);
  }

  if (error instanceof PrescriptionCancellationReasonRequiredDomainError) {
    throw new PrescriptionCancellationReasonRequiredError(tenantId, prescriptionId);
  }

  if (error instanceof PrescriptionInvalidTransitionDomainError) {
    switch (action) {
      case 'emit':
      case 'edit':
        throw new PrescriptionNotDraftError(tenantId, prescriptionId);
      default:
        throw new PrescriptionInvalidTransitionError(tenantId, prescriptionId);
    }
  }

  throw error;
}

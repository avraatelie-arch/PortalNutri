import { ClinicalEvolutionFinalizationRequirementsNotMetDomainError } from '../domain/errors/clinical-evolution-finalization-requirements-not-met.domain-error.js';
import { ClinicalEvolutionInvalidTransitionDomainError } from '../domain/errors/clinical-evolution-invalid-transition.domain-error.js';
import { ClinicalEvolutionNotDraftDomainError } from '../domain/errors/clinical-evolution-not-draft.domain-error.js';
import { ClinicalEvolutionTerminalDomainError } from '../domain/errors/clinical-evolution-terminal.domain-error.js';
import { ClinicalEvolutionAlreadyTerminalError } from './errors/clinical-evolution-already-terminal.error.js';
import { ClinicalEvolutionFinalizationRequirementsNotMetError } from './errors/clinical-evolution-finalization-requirements-not-met.error.js';
import { ClinicalEvolutionInvalidTransitionError } from './errors/clinical-evolution-invalid-transition.error.js';
import { ClinicalEvolutionNotDraftError } from './errors/clinical-evolution-not-draft.error.js';

export type ClinicalEvolutionMutationAction =
  | 'edit'
  | 'finalize'
  | 'cancel'
  | 'changeResponsibleNutritionist';

export function mapClinicalEvolutionDomainError(
  tenantId: string,
  clinicalEvolutionId: string,
  action: ClinicalEvolutionMutationAction,
  error: unknown,
): never {
  if (error instanceof ClinicalEvolutionTerminalDomainError) {
    throw new ClinicalEvolutionAlreadyTerminalError(tenantId, clinicalEvolutionId);
  }

  if (error instanceof ClinicalEvolutionFinalizationRequirementsNotMetDomainError) {
    throw new ClinicalEvolutionFinalizationRequirementsNotMetError(
      tenantId,
      clinicalEvolutionId,
    );
  }

  if (error instanceof ClinicalEvolutionNotDraftDomainError) {
    throw new ClinicalEvolutionNotDraftError(tenantId, clinicalEvolutionId);
  }

  if (error instanceof ClinicalEvolutionInvalidTransitionDomainError) {
    switch (action) {
      case 'edit':
      case 'finalize':
      case 'cancel':
        throw new ClinicalEvolutionNotDraftError(tenantId, clinicalEvolutionId);
      default:
        throw new ClinicalEvolutionInvalidTransitionError(tenantId, clinicalEvolutionId);
    }
  }

  throw error;
}

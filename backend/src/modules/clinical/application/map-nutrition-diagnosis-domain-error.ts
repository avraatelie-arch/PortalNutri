import { NutritionDiagnosisInvalidTransitionDomainError } from '../domain/errors/nutrition-diagnosis-invalid-transition.domain-error.js';
import { NutritionDiagnosisTerminalDomainError } from '../domain/errors/nutrition-diagnosis-terminal.domain-error.js';
import { NutritionDiagnosisCancellationReasonRequiredDomainError } from '../domain/errors/nutrition-diagnosis-cancellation-reason-required.domain-error.js';
import { NutritionDiagnosisInterpretationRequiredDomainError } from '../domain/errors/nutrition-diagnosis-interpretation-required.domain-error.js';
import { NutritionDiagnosisAlreadyTerminalError } from './errors/nutrition-diagnosis-already-terminal.error.js';
import { NutritionDiagnosisInvalidTransitionError } from './errors/nutrition-diagnosis-invalid-transition.error.js';
import { NutritionDiagnosisNotDraftError } from './errors/nutrition-diagnosis-not-draft.error.js';
import { NutritionDiagnosisInterpretationRequiredForConfirmationError } from './errors/nutrition-diagnosis-interpretation-required-for-confirmation.error.js';
import { NutritionDiagnosisCancellationReasonRequiredError } from './errors/nutrition-diagnosis-cancellation-reason-required.error.js';

export type NutritionDiagnosisMutationAction =
  | 'confirm'
  | 'cancel'
  | 'edit'
  | 'changeResponsibleNutritionist';

export function mapNutritionDiagnosisDomainError(
  tenantId: string,
  nutritionDiagnosisId: string,
  action: NutritionDiagnosisMutationAction,
  error: unknown,
): never {
  if (error instanceof NutritionDiagnosisTerminalDomainError) {
    throw new NutritionDiagnosisAlreadyTerminalError(tenantId, nutritionDiagnosisId);
  }

  if (error instanceof NutritionDiagnosisInterpretationRequiredDomainError) {
    throw new NutritionDiagnosisInterpretationRequiredForConfirmationError(
      tenantId,
      nutritionDiagnosisId,
    );
  }

  if (error instanceof NutritionDiagnosisCancellationReasonRequiredDomainError) {
    throw new NutritionDiagnosisCancellationReasonRequiredError(
      tenantId,
      nutritionDiagnosisId,
    );
  }

  if (error instanceof NutritionDiagnosisInvalidTransitionDomainError) {
    switch (action) {
      case 'confirm':
      case 'edit':
        throw new NutritionDiagnosisNotDraftError(tenantId, nutritionDiagnosisId);
      default:
        throw new NutritionDiagnosisInvalidTransitionError(tenantId, nutritionDiagnosisId);
    }
  }

  throw error;
}

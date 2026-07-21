import { MealPlanActivationRequirementsNotMetDomainError } from '../domain/errors/meal-plan-activation-requirements-not-met.domain-error.js';
import { MealPlanCancellationReasonRequiredDomainError } from '../domain/errors/meal-plan-cancellation-reason-required.domain-error.js';
import { MealPlanInvalidTransitionDomainError } from '../domain/errors/meal-plan-invalid-transition.domain-error.js';
import { MealPlanTerminalDomainError } from '../domain/errors/meal-plan-terminal.domain-error.js';
import { MealPlanActivationRequirementsNotMetError } from './errors/meal-plan-activation-requirements-not-met.error.js';
import { MealPlanAlreadyTerminalError } from './errors/meal-plan-already-terminal.error.js';
import { MealPlanCancellationReasonRequiredError } from './errors/meal-plan-cancellation-reason-required.error.js';
import { MealPlanInvalidTransitionError } from './errors/meal-plan-invalid-transition.error.js';
import { MealPlanNotDraftError } from './errors/meal-plan-not-draft.error.js';

export type MealPlanMutationAction =
  | 'activate'
  | 'cancel'
  | 'edit'
  | 'changeResponsibleNutritionist';

export function mapMealPlanDomainError(
  tenantId: string,
  mealPlanId: string,
  action: MealPlanMutationAction,
  error: unknown,
): never {
  if (error instanceof MealPlanTerminalDomainError) {
    throw new MealPlanAlreadyTerminalError(tenantId, mealPlanId);
  }

  if (error instanceof MealPlanActivationRequirementsNotMetDomainError) {
    throw new MealPlanActivationRequirementsNotMetError(tenantId, mealPlanId);
  }

  if (error instanceof MealPlanCancellationReasonRequiredDomainError) {
    throw new MealPlanCancellationReasonRequiredError(tenantId, mealPlanId);
  }

  if (error instanceof MealPlanInvalidTransitionDomainError) {
    switch (action) {
      case 'activate':
      case 'edit':
        throw new MealPlanNotDraftError(tenantId, mealPlanId);
      default:
        throw new MealPlanInvalidTransitionError(tenantId, mealPlanId);
    }
  }

  throw error;
}

import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import { executeMealPlanUseCase } from '../execute-meal-plan-use-case.js';
import { validateActiveNutritionistForMealPlan } from '../meal-plan-creation-context.js';
import { createMealPlanCreationContextErrors } from '../meal-plan-creation-context.errors.js';
import { loadTenantScopedMealPlan } from '../load-tenant-scoped-meal-plan.js';
import { mapMealPlanDomainError } from '../map-meal-plan-domain-error.js';
import { toMealPlanResult } from '../meal-plan-result.js';
import { persistAndDispatchMealPlanEvents } from '../persist-and-dispatch-meal-plan-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import { ChangeMealPlanResponsibleNutritionistCommand } from './change-meal-plan-responsible-nutritionist.command.js';

export class ChangeMealPlanResponsibleNutritionistHandler {
  private readonly creationContextErrors = createMealPlanCreationContextErrors();

  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ChangeMealPlanResponsibleNutritionistCommand) {
    return executeMealPlanUseCase(async () => {
      const { tenantId, mealPlanId, responsibleNutritionistId } = command.request;

      await validateActiveNutritionistForMealPlan({
        nutritionistDirectory: this.nutritionistDirectory,
        tenantId,
        nutritionistId: responsibleNutritionistId,
        errors: this.creationContextErrors,
      });

      const mealPlan = await loadTenantScopedMealPlan(
        this.mealPlanRepository,
        tenantId,
        mealPlanId,
      );

      let changed: boolean;

      try {
        changed = mealPlan.changeResponsibleNutritionist(
          responsibleNutritionistId,
          this.clock.now(),
        );
      }
      catch (error) {
        mapMealPlanDomainError(
          tenantId,
          mealPlanId,
          'changeResponsibleNutritionist',
          error,
        );
      }

      if (changed) {
        await persistAndDispatchMealPlanEvents(
          this.mealPlanRepository,
          this.eventDispatcher,
          mealPlan,
        );
      }

      return toMealPlanResult(mealPlan);
    });
  }
}

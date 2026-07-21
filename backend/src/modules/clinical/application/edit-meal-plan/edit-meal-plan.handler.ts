import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { MealPlanMeal } from '../../domain/entities/meal-plan-meal.js';
import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import { GeneralGuidelines } from '../../domain/value-objects/general-guidelines.js';
import { MealContent } from '../../domain/value-objects/meal-content.js';
import { MealName } from '../../domain/value-objects/meal-name.js';
import { MealPlanClinicalNotes } from '../../domain/value-objects/meal-plan-clinical-notes.js';
import { MealPlanTitle } from '../../domain/value-objects/meal-plan-title.js';
import { MealPlanType } from '../../domain/value-objects/meal-plan-type.js';
import { MealScheduledTime } from '../../domain/value-objects/meal-scheduled-time.js';
import { MealSubstitutionNotes } from '../../domain/value-objects/meal-substitution-notes.js';
import { TherapeuticStrategy } from '../../domain/value-objects/therapeutic-strategy.js';
import { executeMealPlanUseCase } from '../execute-meal-plan-use-case.js';
import { loadTenantScopedMealPlan } from '../load-tenant-scoped-meal-plan.js';
import { mapMealPlanDomainError } from '../map-meal-plan-domain-error.js';
import { toMealPlanResult } from '../meal-plan-result.js';
import { persistAndDispatchMealPlanEvents } from '../persist-and-dispatch-meal-plan-events.js';
import type { Clock } from '../ports/clock.port.js';
import type { MealPlanMealRequest } from '../create-meal-plan/create-meal-plan.command.js';
import { EditMealPlanCommand } from './edit-meal-plan.command.js';

export class EditMealPlanHandler {
  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: EditMealPlanCommand) {
    return executeMealPlanUseCase(async () => {
      const {
        tenantId,
        mealPlanId,
        title,
        planType,
        therapeuticStrategy,
        generalGuidelines,
        clinicalNotes,
        validFrom,
        validUntil,
        meals,
      } = command.request;

      const mealPlan = await loadTenantScopedMealPlan(
        this.mealPlanRepository,
        tenantId,
        mealPlanId,
      );

      let changedFields: string[];

      try {
        changedFields = mealPlan.edit(
          {
            title: title !== undefined ? MealPlanTitle.create(title) : undefined,
            planType:
              planType !== undefined
                ? planType === null
                  ? null
                  : MealPlanType.parse(planType)
                : undefined,
            therapeuticStrategy:
              therapeuticStrategy !== undefined
                ? TherapeuticStrategy.create(therapeuticStrategy)
                : undefined,
            generalGuidelines:
              generalGuidelines !== undefined
                ? GeneralGuidelines.create(generalGuidelines)
                : undefined,
            clinicalNotes:
              clinicalNotes !== undefined
                ? MealPlanClinicalNotes.create(clinicalNotes)
                : undefined,
            validFrom:
              validFrom !== undefined
                ? validFrom === null
                  ? null
                  : new Date(validFrom)
                : undefined,
            validUntil:
              validUntil !== undefined
                ? validUntil === null
                  ? null
                  : new Date(validUntil)
                : undefined,
            meals: mapMealRequests(meals),
          },
          this.clock.now(),
        );
      }
      catch (error) {
        mapMealPlanDomainError(tenantId, mealPlanId, 'edit', error);
      }

      if (changedFields.length > 0) {
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

function mapMealRequests(meals?: MealPlanMealRequest[]): MealPlanMeal[] | undefined {
  if (meals === undefined) {
    return undefined;
  }

  return meals.map((meal) =>
    MealPlanMeal.create({
      sortOrder: meal.sortOrder,
      name: MealName.create(meal.name),
      scheduledTime: MealScheduledTime.create(meal.scheduledTime),
      content: MealContent.create(meal.content),
      substitutionNotes:
        meal.substitutionNotes !== undefined
          ? MealSubstitutionNotes.create(meal.substitutionNotes)
          : undefined,
    }),
  );
}

import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
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
import {
  buildMealPlanCreationContext,
} from '../meal-plan-creation-context.js';
import { createMealPlanCreationContextErrors } from '../meal-plan-creation-context.errors.js';
import { toMealPlanResult } from '../meal-plan-result.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import {
  CreateMealPlanCommand,
  type MealPlanMealRequest,
} from './create-meal-plan.command.js';

export class CreateMealPlanHandler {
  private readonly creationContextErrors = createMealPlanCreationContextErrors();

  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreateMealPlanCommand) {
    return executeMealPlanUseCase(async () => {
      const {
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        planType,
        title,
        therapeuticStrategy,
        generalGuidelines,
        clinicalNotes,
        validFrom,
        validUntil,
        meals,
      } = command.request;

      await buildMealPlanCreationContext({
        tenantDirectory: this.tenantDirectory,
        patientClinicalDirectory: this.patientClinicalDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        clinicalEncounterDirectory: this.clinicalEncounterDirectory,
        anamnesisDirectory: this.anamnesisDirectory,
        request: {
          tenantId,
          patientId,
          createdByNutritionistId,
          responsibleNutritionistId,
          originClinicalEncounterId,
          originAnamnesisId,
        },
        errors: this.creationContextErrors,
      });

      const mealPlan = MealPlan.create({
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        planType: planType ? MealPlanType.parse(planType) : undefined,
        title: title !== undefined ? MealPlanTitle.create(title) : undefined,
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
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        meals: mapMealRequests(meals),
        now: this.clock.now(),
      });

      await this.mealPlanRepository.save(mealPlan);
      await this.eventDispatcher.dispatch(mealPlan.pullDomainEvents());

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

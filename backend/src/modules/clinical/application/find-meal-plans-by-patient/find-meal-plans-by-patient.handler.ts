import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import { parseMealPlanStatus } from '../../domain/value-objects/meal-plan-status.js';
import {
  toMealPlanResult,
  type MealPlanResult,
} from '../meal-plan-result.js';
import { executeMealPlanUseCase } from '../execute-meal-plan-use-case.js';
import { FindMealPlansByPatientQuery } from './find-meal-plans-by-patient.query.js';

export class FindMealPlansByPatientHandler {
  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
  ) {}

  async execute(
    query: FindMealPlansByPatientQuery,
  ): Promise<MealPlanResult[]> {
    return executeMealPlanUseCase(async () => {
      const { tenantId, patientId, status } = query.request;

      const mealPlans = await this.mealPlanRepository.findByPatient(
        tenantId,
        patientId,
        status ? [parseMealPlanStatus(status)] : undefined,
      );

      return mealPlans.map(toMealPlanResult);
    });
  }
}

import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import {
  toMealPlanResult,
  type MealPlanResult,
} from '../meal-plan-result.js';
import { executeMealPlanUseCase } from '../execute-meal-plan-use-case.js';
import { FindActiveMealPlansByPatientQuery } from './find-active-meal-plans-by-patient.query.js';

export class FindActiveMealPlansByPatientHandler {
  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
  ) {}

  async execute(
    query: FindActiveMealPlansByPatientQuery,
  ): Promise<MealPlanResult[]> {
    return executeMealPlanUseCase(async () => {
      const { tenantId, patientId } = query.request;

      const mealPlans = await this.mealPlanRepository.findActiveByPatient(
        tenantId,
        patientId,
      );

      return mealPlans.map(toMealPlanResult);
    });
  }
}

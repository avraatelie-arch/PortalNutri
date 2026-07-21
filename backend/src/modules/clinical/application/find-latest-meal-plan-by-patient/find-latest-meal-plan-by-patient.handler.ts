import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import { executeMealPlanUseCase } from '../execute-meal-plan-use-case.js';
import { toMealPlanResult } from '../meal-plan-result.js';
import { FindLatestMealPlanByPatientQuery } from './find-latest-meal-plan-by-patient.query.js';

export class FindLatestMealPlanByPatientHandler {
  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
  ) {}

  async execute(query: FindLatestMealPlanByPatientQuery) {
    return executeMealPlanUseCase(async () => {
      const { tenantId, patientId } = query.request;

      const mealPlan = await this.mealPlanRepository.findLatestByPatient(
        tenantId,
        patientId,
      );

      return mealPlan ? toMealPlanResult(mealPlan) : null;
    });
  }
}

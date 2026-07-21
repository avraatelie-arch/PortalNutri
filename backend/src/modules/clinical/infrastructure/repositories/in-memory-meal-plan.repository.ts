import type { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import type { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import {
  MealPlanStatusValue,
  type MealPlanStatus,
} from '../../domain/value-objects/meal-plan-status.js';
import {
  getLatestMealPlanByEffectiveDate,
  sortMealPlansByEffectiveDate,
} from './meal-plan-sort.js';

export class InMemoryMealPlanRepository implements MealPlanRepository {
  private readonly mealPlans = new Map<string, MealPlan>();

  async save(mealPlan: MealPlan): Promise<void> {
    this.mealPlans.set(mealPlan.getId().toString(), mealPlan);
  }

  async findByTenantAndId(
    tenantId: string,
    id: MealPlanId,
  ): Promise<MealPlan | null> {
    const mealPlan = this.mealPlans.get(id.toString());

    if (!mealPlan || mealPlan.getTenantId() !== tenantId) {
      return null;
    }

    return mealPlan;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: MealPlanStatus[],
  ): Promise<MealPlan[]> {
    const matches = [...this.mealPlans.values()].filter((mealPlan) => {
      if (
        mealPlan.getTenantId() !== tenantId
        || mealPlan.getPatientId() !== patientId
      ) {
        return false;
      }

      if (statuses && statuses.length > 0) {
        return statuses.includes(mealPlan.getStatus());
      }

      return true;
    });

    return sortMealPlansByEffectiveDate(matches);
  }

  async findActiveByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<MealPlan[]> {
    return this.findByPatient(tenantId, patientId, [
      MealPlanStatusValue.Active,
    ]);
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<MealPlan[]> {
    const matches = [...this.mealPlans.values()].filter(
      (mealPlan) =>
        mealPlan.getTenantId() === tenantId
        && mealPlan.getResponsibleNutritionistId() === nutritionistId,
    );

    return sortMealPlansByEffectiveDate(matches);
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<MealPlan[]> {
    const matches = [...this.mealPlans.values()].filter(
      (mealPlan) =>
        mealPlan.getTenantId() === tenantId
        && mealPlan.getOriginClinicalEncounterId() === clinicalEncounterId,
    );

    return sortMealPlansByEffectiveDate(matches);
  }

  async findByStatus(
    tenantId: string,
    status: MealPlanStatus,
  ): Promise<MealPlan[]> {
    const matches = [...this.mealPlans.values()].filter(
      (mealPlan) =>
        mealPlan.getTenantId() === tenantId && mealPlan.getStatus() === status,
    );

    return sortMealPlansByEffectiveDate(matches);
  }

  async findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<MealPlan | null> {
    const matches = [...this.mealPlans.values()].filter(
      (mealPlan) =>
        mealPlan.getTenantId() === tenantId
        && mealPlan.getPatientId() === patientId,
    );

    return getLatestMealPlanByEffectiveDate(matches);
  }
}

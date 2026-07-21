import type { MealPlan } from '../aggregates/meal-plan.aggregate.js';
import type { MealPlanId } from '../value-objects/meal-plan-id.js';
import type { MealPlanStatus } from '../value-objects/meal-plan-status.js';

export interface MealPlanRepository {
  save(mealPlan: MealPlan): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: MealPlanId,
  ): Promise<MealPlan | null>;
  findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: MealPlanStatus[],
  ): Promise<MealPlan[]>;
  findActiveByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<MealPlan[]>;
  findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<MealPlan[]>;
  findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<MealPlan[]>;
  findByStatus(
    tenantId: string,
    status: MealPlanStatus,
  ): Promise<MealPlan[]>;
  findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<MealPlan | null>;
}

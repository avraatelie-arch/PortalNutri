import type { Nutritionist } from '../../domain/aggregates/nutritionist.aggregate.js';
import type { NutritionistStatus } from '../../domain/value-objects/nutritionist-status.js';

export interface FindNutritionistResult {
  id: string;
  personId: string;
  tenantId: string;
  crn: string;
  stateCode: string;
  specialty: string;
  bio: string | null;
  status: NutritionistStatus;
  createdAt: string;
  updatedAt: string;
}

export function toFindNutritionistResult(
  nutritionist: Nutritionist,
): FindNutritionistResult {
  return {
    id: nutritionist.getId().toString(),
    personId: nutritionist.getPersonId().toString(),
    tenantId: nutritionist.getTenantId().toString(),
    crn: nutritionist.getCrn().toString(),
    stateCode: nutritionist.getStateCode().toString(),
    specialty: nutritionist.getSpecialty().toString(),
    bio: nutritionist.getBio(),
    status: nutritionist.getStatus(),
    createdAt: nutritionist.getCreatedAt().toISOString(),
    updatedAt: nutritionist.getUpdatedAt().toISOString(),
  };
}

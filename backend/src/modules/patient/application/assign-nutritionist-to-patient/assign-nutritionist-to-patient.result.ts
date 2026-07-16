import type { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import type { PatientNutritionistAssignmentRoleValue } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import type { PatientNutritionistAssignmentStatus } from '../../domain/value-objects/patient-nutritionist-assignment-status.js';

export type AssignNutritionistToPatientOperation = 'CREATED' | 'REACTIVATED';

export interface AssignNutritionistToPatientResult {
  id: string;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  role: PatientNutritionistAssignmentRoleValue;
  status: PatientNutritionistAssignmentStatus;
  createdAt: string;
  reactivatedAt: string | null;
  removedAt: string | null;
  operation: AssignNutritionistToPatientOperation;
}

export function toAssignNutritionistToPatientResult(
  assignment: PatientNutritionistAssignment,
  operation: AssignNutritionistToPatientOperation,
): AssignNutritionistToPatientResult {
  return {
    id: assignment.getId().toString(),
    tenantId: assignment.getTenantId().toString(),
    patientId: assignment.getPatientId().toString(),
    nutritionistId: assignment.getNutritionistId(),
    role: assignment.getRole().toString(),
    status: assignment.getStatus(),
    createdAt: assignment.getCreatedAt().toISOString(),
    reactivatedAt: assignment.getReactivatedAt()?.toISOString() ?? null,
    removedAt: assignment.getRemovedAt()?.toISOString() ?? null,
    operation,
  };
}

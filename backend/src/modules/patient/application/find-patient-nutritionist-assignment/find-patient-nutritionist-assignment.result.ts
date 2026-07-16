import type { PatientNutritionistAssignmentRoleValue } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import type { PatientNutritionistAssignmentStatus } from '../../domain/value-objects/patient-nutritionist-assignment-status.js';

export interface FindPatientNutritionistAssignmentResult {
  id: string;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  role: PatientNutritionistAssignmentRoleValue;
  status: PatientNutritionistAssignmentStatus;
  createdAt: string;
  reactivatedAt: string | null;
  removedAt: string | null;
}

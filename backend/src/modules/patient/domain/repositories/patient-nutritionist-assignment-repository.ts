import type { PatientNutritionistAssignment } from '../aggregates/patient-nutritionist-assignment.aggregate.js';
import type { PatientNutritionistAssignmentId } from '../value-objects/patient-nutritionist-assignment-id.js';
import type { PatientId } from '../value-objects/patient-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export interface PatientNutritionistAssignmentRepository {
  save(assignment: PatientNutritionistAssignment): Promise<void>;
  findById(
    id: PatientNutritionistAssignmentId,
  ): Promise<PatientNutritionistAssignment | null>;
  findByPatientAndNutritionist(
    tenantId: TenantId,
    patientId: PatientId,
    nutritionistId: string,
  ): Promise<PatientNutritionistAssignment | null>;
  findActivePrimaryByPatient(
    tenantId: TenantId,
    patientId: PatientId,
  ): Promise<PatientNutritionistAssignment | null>;
  findActiveByPatient(
    tenantId: TenantId,
    patientId: PatientId,
  ): Promise<PatientNutritionistAssignment[]>;
  findActiveByNutritionist(
    tenantId: TenantId,
    nutritionistId: string,
  ): Promise<PatientNutritionistAssignment[]>;
}

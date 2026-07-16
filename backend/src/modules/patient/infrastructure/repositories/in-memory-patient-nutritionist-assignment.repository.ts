import type { PatientNutritionistAssignmentRepository } from '../../domain/repositories/patient-nutritionist-assignment-repository.js';
import type { PatientNutritionistAssignment } from '../../domain/aggregates/patient-nutritionist-assignment.aggregate.js';
import type { PatientNutritionistAssignmentId } from '../../domain/value-objects/patient-nutritionist-assignment-id.js';
import type { PatientId } from '../../domain/value-objects/patient-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { PatientNutritionistAssignmentRoleValue } from '../../domain/value-objects/patient-nutritionist-assignment-role.js';
import { PatientNutritionistAssignmentStatus } from '../../domain/value-objects/patient-nutritionist-assignment-status.js';

export class InMemoryPatientNutritionistAssignmentRepository
  implements PatientNutritionistAssignmentRepository
{
  private readonly assignments = new Map<string, PatientNutritionistAssignment>();

  async save(assignment: PatientNutritionistAssignment): Promise<void> {
    this.assignments.set(assignment.getId().toString(), assignment);
  }

  async findById(
    id: PatientNutritionistAssignmentId,
  ): Promise<PatientNutritionistAssignment | null> {
    return this.assignments.get(id.toString()) ?? null;
  }

  async findByPatientAndNutritionist(
    tenantId: TenantId,
    patientId: PatientId,
    nutritionistId: string,
  ): Promise<PatientNutritionistAssignment | null> {
    for (const assignment of this.assignments.values()) {
      if (
        assignment.getTenantId().equals(tenantId) &&
        assignment.getPatientId().equals(patientId) &&
        assignment.getNutritionistId() === nutritionistId
      ) {
        return assignment;
      }
    }

    return null;
  }

  async findActivePrimaryByPatient(
    tenantId: TenantId,
    patientId: PatientId,
  ): Promise<PatientNutritionistAssignment | null> {
    for (const assignment of this.assignments.values()) {
      if (
        assignment.getTenantId().equals(tenantId) &&
        assignment.getPatientId().equals(patientId) &&
        assignment.isActive() &&
        assignment.getRole().toString() ===
          PatientNutritionistAssignmentRoleValue.Primary
      ) {
        return assignment;
      }
    }

    return null;
  }

  async findActiveByPatient(
    tenantId: TenantId,
    patientId: PatientId,
  ): Promise<PatientNutritionistAssignment[]> {
    return [...this.assignments.values()].filter(
      (assignment) =>
        assignment.getTenantId().equals(tenantId) &&
        assignment.getPatientId().equals(patientId) &&
        assignment.isActive(),
    );
  }

  async findActiveByNutritionist(
    tenantId: TenantId,
    nutritionistId: string,
  ): Promise<PatientNutritionistAssignment[]> {
    return [...this.assignments.values()].filter(
      (assignment) =>
        assignment.getTenantId().equals(tenantId) &&
        assignment.getNutritionistId() === nutritionistId &&
        assignment.isActive(),
    );
  }
}

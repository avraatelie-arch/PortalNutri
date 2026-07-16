import type { Patient } from '../aggregates/patient.aggregate.js';
import type { PatientId } from '../value-objects/patient-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

/**
 * Patient ownership is scoped to Tenant.
 *
 * The relationship between Patient and Nutritionist will be introduced separately
 * as PatientNutritionistAssignment, which may support:
 * - multiple Nutritionists per patient;
 * - a primary Nutritionist;
 * - assignment and removal;
 * - transfer between professionals;
 * - historical care relationships.
 */
export interface PatientRepository {
  save(patient: Patient): Promise<void>;
  findById(id: PatientId): Promise<Patient | null>;
  findByTenantId(tenantId: TenantId): Promise<Patient[]>;
}

import type { NutritionDiagnosis } from '../aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisId } from '../value-objects/nutrition-diagnosis-id.js';
import type { NutritionDiagnosisStatus } from '../value-objects/nutrition-diagnosis-status.js';

export interface NutritionDiagnosisRepository {
  save(diagnosis: NutritionDiagnosis): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: NutritionDiagnosisId,
  ): Promise<NutritionDiagnosis | null>;
  findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: NutritionDiagnosisStatus[],
  ): Promise<NutritionDiagnosis[]>;
  findConfirmedByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<NutritionDiagnosis[]>;
  findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<NutritionDiagnosis[]>;
  findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<NutritionDiagnosis[]>;
  findByStatus(
    tenantId: string,
    status: NutritionDiagnosisStatus,
  ): Promise<NutritionDiagnosis[]>;
  findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<NutritionDiagnosis | null>;
}

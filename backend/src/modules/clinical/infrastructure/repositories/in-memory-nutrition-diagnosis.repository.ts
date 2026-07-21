import type { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import type { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import {
  NutritionDiagnosisStatusValue,
  type NutritionDiagnosisStatus,
} from '../../domain/value-objects/nutrition-diagnosis-status.js';
import {
  getLatestNutritionDiagnosisByEffectiveDate,
  sortNutritionDiagnosesByEffectiveDate,
} from './nutrition-diagnosis-sort.js';

export class InMemoryNutritionDiagnosisRepository implements NutritionDiagnosisRepository {
  private readonly diagnoses = new Map<string, NutritionDiagnosis>();

  async save(diagnosis: NutritionDiagnosis): Promise<void> {
    this.diagnoses.set(diagnosis.getId().toString(), diagnosis);
  }

  async findByTenantAndId(
    tenantId: string,
    id: NutritionDiagnosisId,
  ): Promise<NutritionDiagnosis | null> {
    const diagnosis = this.diagnoses.get(id.toString());

    if (!diagnosis || diagnosis.getTenantId() !== tenantId) {
      return null;
    }

    return diagnosis;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: NutritionDiagnosisStatus[],
  ): Promise<NutritionDiagnosis[]> {
    const matches = [...this.diagnoses.values()].filter((diagnosis) => {
      if (
        diagnosis.getTenantId() !== tenantId
        || diagnosis.getPatientId() !== patientId
      ) {
        return false;
      }

      if (statuses && statuses.length > 0) {
        return statuses.includes(diagnosis.getStatus());
      }

      return true;
    });

    return sortNutritionDiagnosesByEffectiveDate(matches);
  }

  async findConfirmedByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<NutritionDiagnosis[]> {
    return this.findByPatient(tenantId, patientId, [
      NutritionDiagnosisStatusValue.Confirmed,
    ]);
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<NutritionDiagnosis[]> {
    const matches = [...this.diagnoses.values()].filter(
      (diagnosis) =>
        diagnosis.getTenantId() === tenantId
        && diagnosis.getResponsibleNutritionistId() === nutritionistId,
    );

    return sortNutritionDiagnosesByEffectiveDate(matches);
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<NutritionDiagnosis[]> {
    const matches = [...this.diagnoses.values()].filter(
      (diagnosis) =>
        diagnosis.getTenantId() === tenantId
        && diagnosis.getOriginClinicalEncounterId() === clinicalEncounterId,
    );

    return sortNutritionDiagnosesByEffectiveDate(matches);
  }

  async findByStatus(
    tenantId: string,
    status: NutritionDiagnosisStatus,
  ): Promise<NutritionDiagnosis[]> {
    const matches = [...this.diagnoses.values()].filter(
      (diagnosis) =>
        diagnosis.getTenantId() === tenantId && diagnosis.getStatus() === status,
    );

    return sortNutritionDiagnosesByEffectiveDate(matches);
  }

  async findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<NutritionDiagnosis | null> {
    const matches = [...this.diagnoses.values()].filter(
      (diagnosis) =>
        diagnosis.getTenantId() === tenantId
        && diagnosis.getPatientId() === patientId,
    );

    return getLatestNutritionDiagnosisByEffectiveDate(matches);
  }
}

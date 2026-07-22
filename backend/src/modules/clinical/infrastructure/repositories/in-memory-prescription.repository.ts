import type { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import type { PrescriptionId } from '../../domain/value-objects/prescription-id.js';
import type { PrescriptionStatus } from '../../domain/value-objects/prescription-status.js';
import {
  getLatestPrescriptionByEffectiveDate,
  sortPrescriptionsByEffectiveDate,
} from './prescription-sort.js';

export class InMemoryPrescriptionRepository implements PrescriptionRepository {
  private readonly prescriptions = new Map<string, Prescription>();

  async save(prescription: Prescription): Promise<void> {
    this.prescriptions.set(prescription.getId().toString(), prescription);
  }

  async findByTenantAndId(
    tenantId: string,
    id: PrescriptionId,
  ): Promise<Prescription | null> {
    const prescription = this.prescriptions.get(id.toString());

    if (!prescription || prescription.getTenantId() !== tenantId) {
      return null;
    }

    return prescription;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: PrescriptionStatus[],
  ): Promise<Prescription[]> {
    const matches = [...this.prescriptions.values()].filter((prescription) => {
      if (
        prescription.getTenantId() !== tenantId
        || prescription.getPatientId() !== patientId
      ) {
        return false;
      }

      if (statuses && statuses.length > 0) {
        return statuses.includes(prescription.getStatus());
      }

      return true;
    });

    return sortPrescriptionsByEffectiveDate(matches);
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<Prescription[]> {
    const matches = [...this.prescriptions.values()].filter(
      (prescription) =>
        prescription.getTenantId() === tenantId
        && prescription.getResponsibleNutritionistId() === nutritionistId,
    );

    return sortPrescriptionsByEffectiveDate(matches);
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<Prescription[]> {
    const matches = [...this.prescriptions.values()].filter(
      (prescription) =>
        prescription.getTenantId() === tenantId
        && prescription.getOriginClinicalEncounterId() === clinicalEncounterId,
    );

    return sortPrescriptionsByEffectiveDate(matches);
  }

  async findByStatus(
    tenantId: string,
    status: PrescriptionStatus,
  ): Promise<Prescription[]> {
    const matches = [...this.prescriptions.values()].filter(
      (prescription) =>
        prescription.getTenantId() === tenantId
        && prescription.getStatus() === status,
    );

    return sortPrescriptionsByEffectiveDate(matches);
  }

  async findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<Prescription | null> {
    const matches = [...this.prescriptions.values()].filter(
      (prescription) =>
        prescription.getTenantId() === tenantId
        && prescription.getPatientId() === patientId,
    );

    return getLatestPrescriptionByEffectiveDate(matches);
  }
}

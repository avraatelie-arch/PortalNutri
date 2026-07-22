import type { Prescription } from '../aggregates/prescription.aggregate.js';
import type { PrescriptionId } from '../value-objects/prescription-id.js';
import type { PrescriptionStatus } from '../value-objects/prescription-status.js';

export interface PrescriptionRepository {
  save(prescription: Prescription): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: PrescriptionId,
  ): Promise<Prescription | null>;
  findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: PrescriptionStatus[],
  ): Promise<Prescription[]>;
  findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<Prescription[]>;
  findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<Prescription[]>;
  findByStatus(
    tenantId: string,
    status: PrescriptionStatus,
  ): Promise<Prescription[]>;
  findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<Prescription | null>;
}

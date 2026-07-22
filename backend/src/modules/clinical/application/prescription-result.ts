import type { Prescription } from '../domain/aggregates/prescription.aggregate.js';
import type { PrescriptionStatus } from '../domain/value-objects/prescription-status.js';

export interface PrescriptionLineResult {
  id: string;
  sortOrder: number;
  description: string;
  doseQuantity: string | null;
  doseUnit: string | null;
  doseUnitCustomDisplay: string | null;
  frequencyDisplayText: string | null;
  frequencyTimesPerDay: number | null;
  frequencyIntervalHours: number | null;
  dosageForm: string | null;
  administrationRoute: string | null;
  activeIngredients: string | null;
  concentration: string | null;
  duration: string | null;
  administrationInstructions: string | null;
  lineClinicalNotes: string | null;
  patientInstructions: string | null;
}

export interface PrescriptionResult {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  status: PrescriptionStatus;
  version: number;
  title: string;
  clinicalNotes: string | null;
  patientInstructions: string | null;
  cancellationReason: string | null;
  issuedAt: string | null;
  cancelledAt: string | null;
  lines: PrescriptionLineResult[];
  createdAt: string;
  updatedAt: string;
}

export function toPrescriptionResult(prescription: Prescription): PrescriptionResult {
  return {
    id: prescription.getId().toString(),
    tenantId: prescription.getTenantId(),
    patientId: prescription.getPatientId(),
    createdByNutritionistId: prescription.getCreatedByNutritionistId(),
    responsibleNutritionistId: prescription.getResponsibleNutritionistId(),
    originClinicalEncounterId: prescription.getOriginClinicalEncounterId(),
    originAnamnesisId: prescription.getOriginAnamnesisId(),
    status: prescription.getStatus(),
    version: prescription.getVersion(),
    title: prescription.getTitle().toPersistence(),
    clinicalNotes: prescription.getClinicalNotes().toPersistence(),
    patientInstructions: prescription.getPatientInstructions().toPersistence(),
    cancellationReason: prescription.getCancellationReason()?.toPersistence() ?? null,
    issuedAt: prescription.getIssuedAt()?.toISOString() ?? null,
    cancelledAt: prescription.getCancelledAt()?.toISOString() ?? null,
    lines: prescription.getLines().map((line) => ({
      id: line.getId().toString(),
      sortOrder: line.getSortOrder(),
      description: line.getDescription().toPersistence(),
      doseQuantity: line.getDose().getQuantity()?.toPersistence() ?? null,
      doseUnit: line.getDose().getUnit()?.toPersistence() ?? null,
      doseUnitCustomDisplay: line.getDose().getCustomDisplay(),
      frequencyDisplayText: line.getFrequency().getDisplayText() || null,
      frequencyTimesPerDay: line.getFrequency().getTimesPerDay(),
      frequencyIntervalHours: line.getFrequency().getIntervalHours(),
      dosageForm: line.getDosageForm().toPersistence(),
      administrationRoute: line.getAdministrationRoute().toPersistence(),
      activeIngredients: line.getActiveIngredients().toPersistence(),
      concentration: line.getConcentration().toPersistence(),
      duration: line.getDuration().toPersistence(),
      administrationInstructions: line.getAdministrationInstructions().toPersistence(),
      lineClinicalNotes: line.getLineClinicalNotes().toPersistence(),
      patientInstructions: line.getPatientInstructions().toPersistence(),
    })),
    createdAt: prescription.getCreatedAt().toISOString(),
    updatedAt: prescription.getUpdatedAt().toISOString(),
  };
}

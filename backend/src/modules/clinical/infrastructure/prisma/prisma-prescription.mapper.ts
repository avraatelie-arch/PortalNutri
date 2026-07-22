import type {
  PrescriptionLine as PrescriptionLineRecord,
  Prescription as PrescriptionRecord,
} from '@prisma/client';
import { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import { PrescriptionLine } from '../../domain/entities/prescription-line.js';
import { Dose } from '../../domain/value-objects/dose.js';
import { DoseQuantity } from '../../domain/value-objects/dose-quantity.js';
import { DoseUnit } from '../../domain/value-objects/dose-unit.js';
import { Frequency } from '../../domain/value-objects/frequency.js';
import { PrescriptionCancellationReason } from '../../domain/value-objects/prescription-cancellation-reason.js';
import { PrescriptionId } from '../../domain/value-objects/prescription-id.js';
import { PrescriptionLineDescription } from '../../domain/value-objects/prescription-line-description.js';
import { PrescriptionLineId } from '../../domain/value-objects/prescription-line-id.js';
import { parsePrescriptionStatus } from '../../domain/value-objects/prescription-status.js';
import { PrescriptionTitle } from '../../domain/value-objects/prescription-title.js';
import {
  ActiveIngredients,
  AdministrationInstructions,
  AdministrationRoute,
  Concentration,
  DosageForm,
  Duration,
  LineClinicalNotes,
  PatientInstructions,
  PrescriptionClinicalNotes,
} from '../../domain/value-objects/prescription-text-sections.js';

export type PrescriptionWithLinesRecord = PrescriptionRecord & {
  lines: PrescriptionLineRecord[];
};

export type PrescriptionPersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  status: PrescriptionRecord['status'];
  title: string;
  clinicalNotes: string | null;
  patientInstructions: string | null;
  cancellationReason: string | null;
  issuedAt: Date | null;
  cancelledAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PrescriptionLinePersistenceInput = {
  id: string;
  prescriptionId: string;
  sortOrder: number;
  description: string;
  doseQuantity: PrescriptionLineRecord['doseQuantity'];
  doseUnit: PrescriptionLineRecord['doseUnit'];
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
};

export function toPersistence(prescription: Prescription): PrescriptionPersistenceInput {
  return {
    id: prescription.getId().toString(),
    tenantId: prescription.getTenantId(),
    patientId: prescription.getPatientId(),
    createdByNutritionistId: prescription.getCreatedByNutritionistId(),
    responsibleNutritionistId: prescription.getResponsibleNutritionistId(),
    originClinicalEncounterId: prescription.getOriginClinicalEncounterId(),
    originAnamnesisId: prescription.getOriginAnamnesisId(),
    status: prescription.getStatus() as PrescriptionRecord['status'],
    title: prescription.getTitle().toPersistence(),
    clinicalNotes: prescription.getClinicalNotes().toPersistence(),
    patientInstructions: prescription.getPatientInstructions().toPersistence(),
    cancellationReason: prescription.getCancellationReason()?.toPersistence() ?? null,
    issuedAt: prescription.getIssuedAt(),
    cancelledAt: prescription.getCancelledAt(),
    version: prescription.getVersion(),
    createdAt: prescription.getCreatedAt(),
    updatedAt: prescription.getUpdatedAt(),
  };
}

export function toLinesPersistence(
  prescription: Prescription,
): PrescriptionLinePersistenceInput[] {
  return prescription.getLines().map((line) => ({
    id: line.getId().toString(),
    prescriptionId: prescription.getId().toString(),
    sortOrder: line.getSortOrder(),
    description: line.getDescription().toPersistence(),
    doseQuantity: line.getDose().getQuantity()?.toDecimal() ?? null,
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
  }));
}

export function toDomain(record: PrescriptionWithLinesRecord): Prescription {
  return Prescription.reconstitute({
    id: PrescriptionId.create(record.id),
    tenantId: record.tenantId,
    patientId: record.patientId,
    createdByNutritionistId: record.createdByNutritionistId,
    responsibleNutritionistId: record.responsibleNutritionistId,
    originClinicalEncounterId: record.originClinicalEncounterId,
    originAnamnesisId: record.originAnamnesisId,
    status: parsePrescriptionStatus(record.status),
    version: record.version,
    title: PrescriptionTitle.fromPersistence(record.title),
    clinicalNotes: PrescriptionClinicalNotes.fromPersistence(record.clinicalNotes),
    patientInstructions: PatientInstructions.fromPersistence(record.patientInstructions),
    cancellationReason: PrescriptionCancellationReason.fromPersistence(record.cancellationReason),
    issuedAt: record.issuedAt,
    cancelledAt: record.cancelledAt,
    lines: record.lines.map(toLineDomain),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toLineDomain(record: PrescriptionLineRecord): PrescriptionLine {
  return PrescriptionLine.reconstitute({
    id: PrescriptionLineId.create(record.id),
    sortOrder: record.sortOrder,
    description: PrescriptionLineDescription.fromPersistence(record.description),
    dose: Dose.fromPersistence({
      quantity: DoseQuantity.fromPersistence(record.doseQuantity),
      unit: DoseUnit.fromPersistence(record.doseUnit),
      customDisplay: record.doseUnitCustomDisplay,
    }),
    frequency: Frequency.fromPersistence({
      displayText: record.frequencyDisplayText,
      timesPerDay: record.frequencyTimesPerDay,
      intervalHours: record.frequencyIntervalHours,
    }),
    dosageForm: DosageForm.fromPersistence(record.dosageForm),
    administrationRoute: AdministrationRoute.fromPersistence(record.administrationRoute),
    activeIngredients: ActiveIngredients.fromPersistence(record.activeIngredients),
    concentration: Concentration.fromPersistence(record.concentration),
    duration: Duration.fromPersistence(record.duration),
    administrationInstructions: AdministrationInstructions.fromPersistence(
      record.administrationInstructions,
    ),
    lineClinicalNotes: LineClinicalNotes.fromPersistence(record.lineClinicalNotes),
    patientInstructions: PatientInstructions.fromPersistence(record.patientInstructions),
  });
}

import type { Anamnesis as AnamnesisRecord } from '@prisma/client';
import { AnamnesisStatus as PrismaAnamnesisStatus } from '@prisma/client';
import { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';
import { AnamnesisStatus } from '../../domain/value-objects/anamnesis-status.js';
import {
  ANAMNESIS_SECTION_MAX_LENGTH,
  CHIEF_COMPLAINT_MAX_LENGTH,
} from '../../domain/value-objects/anamnesis-section.js';
import { ClinicalTextSection } from '../../domain/value-objects/clinical-text-section.js';

export type AnamnesisPersistenceInput = {
  id: string;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  status: PrismaAnamnesisStatus;
  version: number;
  chiefComplaint: string | null;
  currentHistory: string | null;
  medicalHistory: string | null;
  familyHistory: string | null;
  gastrointestinalHistory: string | null;
  dietaryHistory: string | null;
  lifestyleHistory: string | null;
  medicationHistory: string | null;
  supplementHistory: string | null;
  allergiesAndIntolerances: string | null;
  observations: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(anamnesis: Anamnesis): AnamnesisPersistenceInput {
  return {
    id: anamnesis.getId().toString(),
    tenantId: anamnesis.getTenantId(),
    clinicalEncounterId: anamnesis.getClinicalEncounterId(),
    patientId: anamnesis.getPatientId(),
    nutritionistId: anamnesis.getNutritionistId(),
    status: toPrismaStatus(anamnesis.getStatus()),
    version: anamnesis.getVersion(),
    chiefComplaint: anamnesis.getChiefComplaint().toPersistence(),
    currentHistory: anamnesis.getCurrentHistory().toPersistence(),
    medicalHistory: anamnesis.getMedicalHistory().toPersistence(),
    familyHistory: anamnesis.getFamilyHistory().toPersistence(),
    gastrointestinalHistory: anamnesis.getGastrointestinalHistory().toPersistence(),
    dietaryHistory: anamnesis.getDietaryHistory().toPersistence(),
    lifestyleHistory: anamnesis.getLifestyleHistory().toPersistence(),
    medicationHistory: anamnesis.getMedicationHistory().toPersistence(),
    supplementHistory: anamnesis.getSupplementHistory().toPersistence(),
    allergiesAndIntolerances: anamnesis.getAllergiesAndIntolerances().toPersistence(),
    observations: anamnesis.getObservations().toPersistence(),
    completedAt: anamnesis.getCompletedAt(),
    createdAt: anamnesis.getCreatedAt(),
    updatedAt: anamnesis.getUpdatedAt(),
  };
}

export function toDomain(record: AnamnesisRecord): Anamnesis {
  return Anamnesis.reconstitute({
    id: AnamnesisId.create(record.id),
    tenantId: record.tenantId,
    clinicalEncounterId: record.clinicalEncounterId,
    patientId: record.patientId,
    nutritionistId: record.nutritionistId,
    status: toDomainStatus(record.status),
    version: record.version,
    chiefComplaint: ClinicalTextSection.fromPersistence(
      record.chiefComplaint,
      CHIEF_COMPLAINT_MAX_LENGTH,
    ),
    currentHistory: ClinicalTextSection.fromPersistence(
      record.currentHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    medicalHistory: ClinicalTextSection.fromPersistence(
      record.medicalHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    familyHistory: ClinicalTextSection.fromPersistence(
      record.familyHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    gastrointestinalHistory: ClinicalTextSection.fromPersistence(
      record.gastrointestinalHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    dietaryHistory: ClinicalTextSection.fromPersistence(
      record.dietaryHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    lifestyleHistory: ClinicalTextSection.fromPersistence(
      record.lifestyleHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    medicationHistory: ClinicalTextSection.fromPersistence(
      record.medicationHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    supplementHistory: ClinicalTextSection.fromPersistence(
      record.supplementHistory,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    allergiesAndIntolerances: ClinicalTextSection.fromPersistence(
      record.allergiesAndIntolerances,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    observations: ClinicalTextSection.fromPersistence(
      record.observations,
      ANAMNESIS_SECTION_MAX_LENGTH,
    ),
    completedAt: record.completedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaStatus(status: AnamnesisStatus): PrismaAnamnesisStatus {
  return status as PrismaAnamnesisStatus;
}

function toDomainStatus(status: PrismaAnamnesisStatus): AnamnesisStatus {
  return status as AnamnesisStatus;
}

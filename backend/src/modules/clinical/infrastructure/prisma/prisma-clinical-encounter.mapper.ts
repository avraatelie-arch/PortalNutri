import type { ClinicalEncounter as ClinicalEncounterRecord } from '@prisma/client';
import {
  ClinicalEncounterStatus as PrismaStatus,
  ClinicalEncounterType as PrismaType,
} from '@prisma/client';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import { ClinicalEncounterType } from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';

export type ClinicalEncounterPersistenceInput = {
  id: string;
  tenantId: string;
  appointmentId: string | null;
  patientId: string;
  nutritionistId: string;
  type: PrismaType;
  status: PrismaStatus;
  notes: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(
  encounter: ClinicalEncounter,
): ClinicalEncounterPersistenceInput {
  return {
    id: encounter.getId().toString(),
    tenantId: encounter.getTenantId(),
    appointmentId: encounter.getAppointmentId(),
    patientId: encounter.getPatientId(),
    nutritionistId: encounter.getNutritionistId(),
    type: toPrismaType(encounter.getType()),
    status: toPrismaStatus(encounter.getStatus()),
    notes: encounter.getNotes().toString(),
    startedAt: encounter.getStartedAt(),
    finishedAt: encounter.getFinishedAt(),
    createdAt: encounter.getCreatedAt(),
    updatedAt: encounter.getUpdatedAt(),
  };
}

export function toDomain(record: ClinicalEncounterRecord): ClinicalEncounter {
  return ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(record.id),
    tenantId: record.tenantId,
    appointmentId: record.appointmentId,
    patientId: record.patientId,
    nutritionistId: record.nutritionistId,
    type: toDomainType(record.type),
    status: toDomainStatus(record.status),
    notes: ClinicalNotes.create(record.notes),
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaType(type: ClinicalEncounterType): PrismaType {
  return type.toString() as PrismaType;
}

function toDomainType(type: PrismaType): ClinicalEncounterType {
  return ClinicalEncounterType.create(type);
}

function toPrismaStatus(status: ClinicalEncounterStatus): PrismaStatus {
  return status as PrismaStatus;
}

function toDomainStatus(status: PrismaStatus): ClinicalEncounterStatus {
  return status as ClinicalEncounterStatus;
}

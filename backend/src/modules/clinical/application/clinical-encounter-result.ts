import type { ClinicalEncounter } from '../domain/aggregates/clinical-encounter.aggregate.js';
import type { ClinicalEncounterStatus } from '../domain/value-objects/clinical-encounter-status.js';
import type { ClinicalEncounterTypeValue } from '../domain/value-objects/clinical-encounter-type.js';

export interface ClinicalEncounterResult {
  id: string;
  tenantId: string;
  appointmentId: string | null;
  patientId: string;
  nutritionistId: string;
  type: ClinicalEncounterTypeValue;
  status: ClinicalEncounterStatus;
  notes: string | null;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toClinicalEncounterResult(
  encounter: ClinicalEncounter,
): ClinicalEncounterResult {
  return {
    id: encounter.getId().toString(),
    tenantId: encounter.getTenantId(),
    appointmentId: encounter.getAppointmentId(),
    patientId: encounter.getPatientId(),
    nutritionistId: encounter.getNutritionistId(),
    type: encounter.getType().toString(),
    status: encounter.getStatus(),
    notes: encounter.getNotes().toString(),
    startedAt: encounter.getStartedAt().toISOString(),
    finishedAt: encounter.getFinishedAt()?.toISOString() ?? null,
    createdAt: encounter.getCreatedAt().toISOString(),
    updatedAt: encounter.getUpdatedAt().toISOString(),
  };
}

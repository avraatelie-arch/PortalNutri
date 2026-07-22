import type { ClinicalEvolution } from '../domain/aggregates/clinical-evolution.aggregate.js';
import type { ClinicalEvolutionStatus } from '../domain/value-objects/clinical-evolution-status.js';

export interface ClinicalEvolutionResult {
  id: string;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  clinicalMomentAt: string;
  status: ClinicalEvolutionStatus;
  version: number;
  subjectiveEvolution: string | null;
  professionalObservations: string | null;
  treatmentResponse: string | null;
  adherenceAndBarriers: string | null;
  adverseEventsNotes: string | null;
  nextClinicalConsiderations: string | null;
  finalizedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toClinicalEvolutionResult(
  evolution: ClinicalEvolution,
): ClinicalEvolutionResult {
  return {
    id: evolution.getId().toString(),
    tenantId: evolution.getTenantId(),
    clinicalEncounterId: evolution.getClinicalEncounterId(),
    patientId: evolution.getPatientId(),
    createdByNutritionistId: evolution.getCreatedByNutritionistId(),
    responsibleNutritionistId: evolution.getResponsibleNutritionistId(),
    clinicalMomentAt: evolution.getClinicalMomentAt().toISOString(),
    status: evolution.getStatus(),
    version: evolution.getVersion(),
    subjectiveEvolution: evolution.getSubjectiveEvolution().toPersistence(),
    professionalObservations: evolution.getProfessionalObservations().toPersistence(),
    treatmentResponse: evolution.getTreatmentResponse().toPersistence(),
    adherenceAndBarriers: evolution.getAdherenceAndBarriers().toPersistence(),
    adverseEventsNotes: evolution.getAdverseEventsNotes().toPersistence(),
    nextClinicalConsiderations:
      evolution.getNextClinicalConsiderations().toPersistence(),
    finalizedAt: evolution.getFinalizedAt()?.toISOString() ?? null,
    cancelledAt: evolution.getCancelledAt()?.toISOString() ?? null,
    createdAt: evolution.getCreatedAt().toISOString(),
    updatedAt: evolution.getUpdatedAt().toISOString(),
  };
}

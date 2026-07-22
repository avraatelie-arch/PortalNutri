import type { ClinicalEvolution as ClinicalEvolutionRecord } from '@prisma/client';
import { ClinicalEvolutionStatus as PrismaClinicalEvolutionStatus } from '@prisma/client';
import { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import {
  parseClinicalEvolutionStatus,
  type ClinicalEvolutionStatus,
} from '../../domain/value-objects/clinical-evolution-status.js';
import {
  AdherenceAndBarriers,
  AdverseEventsNotes,
  NextClinicalConsiderations,
  ProfessionalObservations,
  SubjectiveEvolution,
  TreatmentResponse,
} from '../../domain/value-objects/clinical-evolution-text-sections.js';

export type ClinicalEvolutionPersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  clinicalEncounterId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  status: PrismaClinicalEvolutionStatus;
  version: number;
  clinicalMomentAt: Date;
  subjectiveEvolution: string | null;
  professionalObservations: string | null;
  treatmentResponse: string | null;
  adherenceAndBarriers: string | null;
  adverseEventsNotes: string | null;
  nextClinicalConsiderations: string | null;
  finalizedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(
  evolution: ClinicalEvolution,
): ClinicalEvolutionPersistenceInput {
  return {
    id: evolution.getId().toString(),
    tenantId: evolution.getTenantId(),
    patientId: evolution.getPatientId(),
    clinicalEncounterId: evolution.getClinicalEncounterId(),
    createdByNutritionistId: evolution.getCreatedByNutritionistId(),
    responsibleNutritionistId: evolution.getResponsibleNutritionistId(),
    status: toPrismaStatus(evolution.getStatus()),
    version: evolution.getVersion(),
    clinicalMomentAt: evolution.getClinicalMomentAt(),
    subjectiveEvolution: evolution.getSubjectiveEvolution().toPersistence(),
    professionalObservations: evolution.getProfessionalObservations().toPersistence(),
    treatmentResponse: evolution.getTreatmentResponse().toPersistence(),
    adherenceAndBarriers: evolution.getAdherenceAndBarriers().toPersistence(),
    adverseEventsNotes: evolution.getAdverseEventsNotes().toPersistence(),
    nextClinicalConsiderations: evolution.getNextClinicalConsiderations().toPersistence(),
    finalizedAt: evolution.getFinalizedAt(),
    cancelledAt: evolution.getCancelledAt(),
    createdAt: evolution.getCreatedAt(),
    updatedAt: evolution.getUpdatedAt(),
  };
}

export function toDomain(record: ClinicalEvolutionRecord): ClinicalEvolution {
  return ClinicalEvolution.reconstitute({
    id: ClinicalEvolutionId.create(record.id),
    tenantId: record.tenantId,
    clinicalEncounterId: record.clinicalEncounterId,
    patientId: record.patientId,
    createdByNutritionistId: record.createdByNutritionistId,
    responsibleNutritionistId: record.responsibleNutritionistId,
    clinicalMomentAt: record.clinicalMomentAt,
    status: toDomainStatus(record.status),
    version: record.version,
    subjectiveEvolution: SubjectiveEvolution.fromPersistence(record.subjectiveEvolution),
    professionalObservations: ProfessionalObservations.fromPersistence(
      record.professionalObservations,
    ),
    treatmentResponse: TreatmentResponse.fromPersistence(record.treatmentResponse),
    adherenceAndBarriers: AdherenceAndBarriers.fromPersistence(record.adherenceAndBarriers),
    adverseEventsNotes: AdverseEventsNotes.fromPersistence(record.adverseEventsNotes),
    nextClinicalConsiderations: NextClinicalConsiderations.fromPersistence(
      record.nextClinicalConsiderations,
    ),
    finalizedAt: record.finalizedAt,
    cancelledAt: record.cancelledAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaStatus(
  status: ClinicalEvolutionStatus,
): PrismaClinicalEvolutionStatus {
  return status as PrismaClinicalEvolutionStatus;
}

function toDomainStatus(
  status: PrismaClinicalEvolutionStatus,
): ClinicalEvolutionStatus {
  return parseClinicalEvolutionStatus(status);
}

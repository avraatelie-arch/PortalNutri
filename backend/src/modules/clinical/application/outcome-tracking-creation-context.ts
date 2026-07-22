import type { ClinicalObjective } from '../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveRepository } from '../domain/repositories/clinical-objective-repository.js';
import type { ClinicalEncounterRepository } from '../domain/repositories/clinical-encounter-repository.js';
import { ClinicalEncounterId } from '../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../domain/value-objects/clinical-encounter-status.js';
import { ClinicalObjectiveId } from '../domain/value-objects/clinical-objective-id.js';
import {
  ClinicalObjectiveStatusValue,
  type ClinicalObjectiveStatus,
} from '../domain/value-objects/clinical-objective-status.js';
import type { AnamnesisDirectoryEntry } from './ports/anamnesis-directory.port.js';
import type { AnamnesisDirectoryPort } from './ports/anamnesis-directory.port.js';
import type { NutritionistDirectoryEntry } from './ports/nutritionist-directory.port.js';
import type { NutritionistDirectoryPort } from './ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryEntry } from './ports/patient-clinical-directory.port.js';
import type { PatientClinicalDirectoryPort } from './ports/patient-clinical-directory.port.js';
import type { TenantDirectoryEntry } from './ports/tenant-directory.port.js';
import type { TenantDirectoryPort } from './ports/tenant-directory.port.js';

export interface OutcomeTrackingCreationContextRequest {
  tenantId: string;
  patientId: string;
  clinicalObjectiveId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
}

export interface OutcomeTrackingCreationContextErrors {
  tenantNotFound: (tenantId: string) => Error;
  tenantInactive: (tenantId: string) => Error;
  patientNotFound: (tenantId: string, patientId: string) => Error;
  patientInactive: (tenantId: string, patientId: string) => Error;
  nutritionistNotFound: (tenantId: string, nutritionistId: string) => Error;
  nutritionistInactive: (tenantId: string, nutritionistId: string) => Error;
  clinicalObjectiveNotFound: (tenantId: string, clinicalObjectiveId: string) => Error;
  clinicalObjectiveNotAssessable: (
    tenantId: string,
    clinicalObjectiveId: string,
    status: ClinicalObjectiveStatus,
  ) => Error;
  clinicalObjectivePatientMismatch: (
    tenantId: string,
    clinicalObjectiveId: string,
    patientId: string,
  ) => Error;
  clinicalEncounterNotFound: (
    tenantId: string,
    clinicalEncounterId: string,
  ) => Error;
  clinicalEncounterCancelled: (
    tenantId: string,
    clinicalEncounterId: string,
  ) => Error;
  clinicalEncounterPatientMismatch: (
    tenantId: string,
    clinicalEncounterId: string,
    patientId: string,
  ) => Error;
  anamnesisNotFound: (tenantId: string, anamnesisId: string) => Error;
  originAnamnesisEncounterMismatch: (
    tenantId: string,
    anamnesisId: string,
    clinicalEncounterId: string,
  ) => Error;
  originAnamnesisPatientMismatch: (
    tenantId: string,
    anamnesisId: string,
    patientId: string,
  ) => Error;
}

export class OutcomeTrackingCreationContext {
  readonly tenant: TenantDirectoryEntry;
  readonly patient: PatientClinicalDirectoryEntry;
  readonly clinicalObjective: ClinicalObjective;
  readonly createdByNutritionist: NutritionistDirectoryEntry;
  readonly responsibleNutritionist: NutritionistDirectoryEntry;
  readonly originClinicalEncounterId: string | null;
  readonly originAnamnesis: AnamnesisDirectoryEntry | null;
  readonly clinicalMomentAt: Date | null;

  private constructor(params: {
    tenant: TenantDirectoryEntry;
    patient: PatientClinicalDirectoryEntry;
    clinicalObjective: ClinicalObjective;
    createdByNutritionist: NutritionistDirectoryEntry;
    responsibleNutritionist: NutritionistDirectoryEntry;
    originClinicalEncounterId: string | null;
    originAnamnesis: AnamnesisDirectoryEntry | null;
    clinicalMomentAt: Date | null;
  }) {
    this.tenant = Object.freeze({ ...params.tenant });
    this.patient = Object.freeze({ ...params.patient });
    this.clinicalObjective = params.clinicalObjective;
    this.createdByNutritionist = Object.freeze({ ...params.createdByNutritionist });
    this.responsibleNutritionist = Object.freeze({ ...params.responsibleNutritionist });
    this.originClinicalEncounterId = params.originClinicalEncounterId;
    this.originAnamnesis = params.originAnamnesis
      ? Object.freeze({ ...params.originAnamnesis })
      : null;
    this.clinicalMomentAt = params.clinicalMomentAt
      ? new Date(params.clinicalMomentAt)
      : null;
    Object.freeze(this);
  }

  static create(params: {
    tenant: TenantDirectoryEntry;
    patient: PatientClinicalDirectoryEntry;
    clinicalObjective: ClinicalObjective;
    createdByNutritionist: NutritionistDirectoryEntry;
    responsibleNutritionist: NutritionistDirectoryEntry;
    originClinicalEncounterId: string | null;
    originAnamnesis: AnamnesisDirectoryEntry | null;
    clinicalMomentAt: Date | null;
  }): OutcomeTrackingCreationContext {
    return new OutcomeTrackingCreationContext(params);
  }
}

export async function buildOutcomeTrackingCreationContext(params: {
  tenantDirectory: TenantDirectoryPort;
  patientClinicalDirectory: PatientClinicalDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  clinicalEncounterRepository: ClinicalEncounterRepository;
  anamnesisDirectory: AnamnesisDirectoryPort;
  clinicalObjectiveRepository: ClinicalObjectiveRepository;
  request: OutcomeTrackingCreationContextRequest;
  errors: OutcomeTrackingCreationContextErrors;
}): Promise<OutcomeTrackingCreationContext> {
  const {
    tenantId,
    patientId,
    clinicalObjectiveId,
    createdByNutritionistId,
    responsibleNutritionistId,
    originClinicalEncounterId,
    originAnamnesisId,
  } = params.request;

  const tenant = await params.tenantDirectory.findById(tenantId);

  if (!tenant) {
    throw params.errors.tenantNotFound(tenantId);
  }

  if (tenant.status !== 'ACTIVE') {
    throw params.errors.tenantInactive(tenantId);
  }

  const patient = await params.patientClinicalDirectory.findByTenantAndId(
    tenantId,
    patientId,
  );

  if (!patient) {
    throw params.errors.patientNotFound(tenantId, patientId);
  }

  if (patient.status !== 'ACTIVE') {
    throw params.errors.patientInactive(tenantId, patientId);
  }

  const createdByNutritionist = await resolveActiveNutritionist(
    params.nutritionistDirectory,
    tenantId,
    createdByNutritionistId,
    params.errors,
  );

  const responsibleNutritionist = await resolveActiveNutritionist(
    params.nutritionistDirectory,
    tenantId,
    responsibleNutritionistId,
    params.errors,
  );

  const clinicalObjective = await params.clinicalObjectiveRepository.findByTenantAndId(
    tenantId,
    ClinicalObjectiveId.create(clinicalObjectiveId),
  );

  if (!clinicalObjective) {
    throw params.errors.clinicalObjectiveNotFound(tenantId, clinicalObjectiveId);
  }

  if (clinicalObjective.getPatientId() !== patientId) {
    throw params.errors.clinicalObjectivePatientMismatch(
      tenantId,
      clinicalObjectiveId,
      patientId,
    );
  }

  const objectiveStatus = clinicalObjective.getStatus();

  if (
    objectiveStatus !== ClinicalObjectiveStatusValue.Active
    && objectiveStatus !== ClinicalObjectiveStatusValue.Paused
  ) {
    throw params.errors.clinicalObjectiveNotAssessable(
      tenantId,
      clinicalObjectiveId,
      objectiveStatus,
    );
  }

  let resolvedOriginClinicalEncounterId: string | null = null;
  let clinicalMomentAt: Date | null = null;

  if (originClinicalEncounterId) {
    const encounter = await params.clinicalEncounterRepository.findByTenantAndId(
      tenantId,
      ClinicalEncounterId.create(originClinicalEncounterId),
    );

    if (!encounter) {
      throw params.errors.clinicalEncounterNotFound(
        tenantId,
        originClinicalEncounterId,
      );
    }

    if (encounter.getStatus() === ClinicalEncounterStatus.Cancelled) {
      throw params.errors.clinicalEncounterCancelled(
        tenantId,
        originClinicalEncounterId,
      );
    }

    if (encounter.getPatientId() !== patientId) {
      throw params.errors.clinicalEncounterPatientMismatch(
        tenantId,
        originClinicalEncounterId,
        patientId,
      );
    }

    resolvedOriginClinicalEncounterId = originClinicalEncounterId;
    clinicalMomentAt = encounter.getStartedAt();
  }

  let originAnamnesis: AnamnesisDirectoryEntry | null = null;

  if (originAnamnesisId) {
    const anamnesis = await params.anamnesisDirectory.findByTenantAndId(
      tenantId,
      originAnamnesisId,
    );

    if (!anamnesis) {
      throw params.errors.anamnesisNotFound(tenantId, originAnamnesisId);
    }

    if (anamnesis.patientId !== patientId) {
      throw params.errors.originAnamnesisPatientMismatch(
        tenantId,
        originAnamnesisId,
        patientId,
      );
    }

    if (
      originClinicalEncounterId
      && anamnesis.clinicalEncounterId !== originClinicalEncounterId
    ) {
      throw params.errors.originAnamnesisEncounterMismatch(
        tenantId,
        originAnamnesisId,
        originClinicalEncounterId,
      );
    }

    originAnamnesis = anamnesis;
  }

  return OutcomeTrackingCreationContext.create({
    tenant,
    patient,
    clinicalObjective,
    createdByNutritionist,
    responsibleNutritionist,
    originClinicalEncounterId: resolvedOriginClinicalEncounterId,
    originAnamnesis,
    clinicalMomentAt,
  });
}

export async function validateActiveNutritionistForOutcomeTracking(params: {
  nutritionistDirectory: NutritionistDirectoryPort;
  tenantId: string;
  nutritionistId: string;
  errors: Pick<
    OutcomeTrackingCreationContextErrors,
    'nutritionistNotFound' | 'nutritionistInactive'
  >;
}): Promise<NutritionistDirectoryEntry> {
  return resolveActiveNutritionist(
    params.nutritionistDirectory,
    params.tenantId,
    params.nutritionistId,
    params.errors,
  );
}

async function resolveActiveNutritionist(
  nutritionistDirectory: NutritionistDirectoryPort,
  tenantId: string,
  nutritionistId: string,
  errors: Pick<
    OutcomeTrackingCreationContextErrors,
    'nutritionistNotFound' | 'nutritionistInactive'
  >,
): Promise<NutritionistDirectoryEntry> {
  const nutritionist = await nutritionistDirectory.findById(nutritionistId);

  if (!nutritionist || nutritionist.tenantId !== tenantId) {
    throw errors.nutritionistNotFound(tenantId, nutritionistId);
  }

  if (nutritionist.status !== 'ACTIVE') {
    throw errors.nutritionistInactive(tenantId, nutritionistId);
  }

  return nutritionist;
}

import {
  resolveClinicalMeasuredAt,
  validateClinicalMeasuredAt,
} from './resolve-clinical-measured-at.js';
import type { AnamnesisDirectoryEntry } from './ports/anamnesis-directory.port.js';
import type { AnamnesisDirectoryPort } from './ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryEntry } from './ports/clinical-encounter-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from './ports/clinical-encounter-directory.port.js';
import type { Clock } from './ports/clock.port.js';
import type { NutritionistDirectoryEntry } from './ports/nutritionist-directory.port.js';
import type { NutritionistDirectoryPort } from './ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryEntry } from './ports/patient-clinical-directory.port.js';
import type { PatientClinicalDirectoryPort } from './ports/patient-clinical-directory.port.js';
import type { TenantDirectoryEntry } from './ports/tenant-directory.port.js';
import type { TenantDirectoryPort } from './ports/tenant-directory.port.js';

export interface ClinicalRecordContextRequest {
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  measuredAt?: Date;
}

export interface ClinicalRecordContextErrors {
  tenantNotFound: (tenantId: string) => Error;
  tenantInactive: (tenantId: string) => Error;
  anamnesisNotFound: (tenantId: string, anamnesisId: string) => Error;
  anamnesisNotDraft: (tenantId: string, anamnesisId: string) => Error;
  anamnesisClinicalEncounterMismatch: (
    tenantId: string,
    anamnesisId: string,
    clinicalEncounterId: string,
  ) => Error;
  anamnesisPatientMismatch: (
    tenantId: string,
    anamnesisId: string,
    patientId: string,
  ) => Error;
  anamnesisNutritionistMismatch: (
    tenantId: string,
    anamnesisId: string,
    nutritionistId: string,
  ) => Error;
  clinicalEncounterNotFound: (
    tenantId: string,
    clinicalEncounterId: string,
  ) => Error;
  clinicalEncounterNotOpen: (
    tenantId: string,
    clinicalEncounterId: string,
  ) => Error;
  clinicalEncounterPatientMismatch: (
    tenantId: string,
    clinicalEncounterId: string,
    patientId: string,
  ) => Error;
  clinicalEncounterNutritionistMismatch: (
    tenantId: string,
    clinicalEncounterId: string,
    nutritionistId: string,
  ) => Error;
  patientNotFound: (tenantId: string, patientId: string) => Error;
  patientInactive: (tenantId: string, patientId: string) => Error;
  nutritionistNotFound: (tenantId: string, nutritionistId: string) => Error;
  nutritionistInactive: (tenantId: string, nutritionistId: string) => Error;
  nutritionistTenantMismatch: (tenantId: string, nutritionistId: string) => Error;
  measuredAtFutureDate: (tenantId: string, patientId: string) => Error;
  measuredAtBeforeBirth: (tenantId: string, patientId: string) => Error;
}

export class ClinicalRecordContext {
  readonly tenant: TenantDirectoryEntry;
  readonly anamnesis: AnamnesisDirectoryEntry;
  readonly encounter: ClinicalEncounterDirectoryEntry;
  readonly patient: PatientClinicalDirectoryEntry;
  readonly nutritionist: NutritionistDirectoryEntry;
  readonly measuredAt: Date;

  private constructor(params: {
    tenant: TenantDirectoryEntry;
    anamnesis: AnamnesisDirectoryEntry;
    encounter: ClinicalEncounterDirectoryEntry;
    patient: PatientClinicalDirectoryEntry;
    nutritionist: NutritionistDirectoryEntry;
    measuredAt: Date;
  }) {
    this.tenant = Object.freeze({ ...params.tenant });
    this.anamnesis = Object.freeze({ ...params.anamnesis });
    this.encounter = Object.freeze({ ...params.encounter });
    this.patient = Object.freeze({ ...params.patient });
    this.nutritionist = Object.freeze({ ...params.nutritionist });
    this.measuredAt = new Date(params.measuredAt.getTime());
    Object.freeze(this);
  }

  static create(params: {
    tenant: TenantDirectoryEntry;
    anamnesis: AnamnesisDirectoryEntry;
    encounter: ClinicalEncounterDirectoryEntry;
    patient: PatientClinicalDirectoryEntry;
    nutritionist: NutritionistDirectoryEntry;
    measuredAt: Date;
  }): ClinicalRecordContext {
    return new ClinicalRecordContext(params);
  }
}

export async function buildClinicalRecordContext(params: {
  tenantDirectory: TenantDirectoryPort;
  anamnesisDirectory: AnamnesisDirectoryPort;
  clinicalEncounterDirectory: ClinicalEncounterDirectoryPort;
  patientClinicalDirectory: PatientClinicalDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  clock: Clock;
  request: ClinicalRecordContextRequest;
  errors: ClinicalRecordContextErrors;
}): Promise<ClinicalRecordContext> {
  const {
    tenantId,
    anamnesisId,
    clinicalEncounterId,
    patientId,
    nutritionistId,
    measuredAt,
  } = params.request;

  const tenant = await params.tenantDirectory.findById(tenantId);

  if (!tenant) {
    throw params.errors.tenantNotFound(tenantId);
  }

  if (tenant.status !== 'ACTIVE') {
    throw params.errors.tenantInactive(tenantId);
  }

  const anamnesis = await params.anamnesisDirectory.findByTenantAndId(
    tenantId,
    anamnesisId,
  );

  if (!anamnesis) {
    throw params.errors.anamnesisNotFound(tenantId, anamnesisId);
  }

  if (anamnesis.status !== 'DRAFT') {
    throw params.errors.anamnesisNotDraft(tenantId, anamnesisId);
  }

  if (anamnesis.clinicalEncounterId !== clinicalEncounterId) {
    throw params.errors.anamnesisClinicalEncounterMismatch(
      tenantId,
      anamnesisId,
      clinicalEncounterId,
    );
  }

  if (anamnesis.patientId !== patientId) {
    throw params.errors.anamnesisPatientMismatch(tenantId, anamnesisId, patientId);
  }

  if (anamnesis.nutritionistId !== nutritionistId) {
    throw params.errors.anamnesisNutritionistMismatch(
      tenantId,
      anamnesisId,
      nutritionistId,
    );
  }

  const encounter = await params.clinicalEncounterDirectory.findByTenantAndId(
    tenantId,
    clinicalEncounterId,
  );

  if (!encounter) {
    throw params.errors.clinicalEncounterNotFound(tenantId, clinicalEncounterId);
  }

  if (encounter.status !== 'OPEN') {
    throw params.errors.clinicalEncounterNotOpen(tenantId, clinicalEncounterId);
  }

  if (encounter.patientId !== patientId) {
    throw params.errors.clinicalEncounterPatientMismatch(
      tenantId,
      clinicalEncounterId,
      patientId,
    );
  }

  if (encounter.nutritionistId !== nutritionistId) {
    throw params.errors.clinicalEncounterNutritionistMismatch(
      tenantId,
      clinicalEncounterId,
      nutritionistId,
    );
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

  const nutritionist = await params.nutritionistDirectory.findById(nutritionistId);

  if (!nutritionist) {
    throw params.errors.nutritionistNotFound(tenantId, nutritionistId);
  }

  if (nutritionist.tenantId !== tenantId) {
    throw params.errors.nutritionistTenantMismatch(tenantId, nutritionistId);
  }

  if (nutritionist.status !== 'ACTIVE') {
    throw params.errors.nutritionistInactive(tenantId, nutritionistId);
  }

  const resolvedMeasuredAt = resolveClinicalMeasuredAt(measuredAt, params.clock);

  validateClinicalMeasuredAt(
    resolvedMeasuredAt,
    params.clock,
    patient.birthDate,
    {
      onFutureDate: () =>
        params.errors.measuredAtFutureDate(tenantId, patientId),
      onBeforeBirth: () =>
        params.errors.measuredAtBeforeBirth(tenantId, patientId),
    },
  );

  return ClinicalRecordContext.create({
    tenant,
    anamnesis,
    encounter,
    patient,
    nutritionist,
    measuredAt: resolvedMeasuredAt,
  });
}

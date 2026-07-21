import type { AnamnesisDirectoryEntry } from './ports/anamnesis-directory.port.js';
import type { AnamnesisDirectoryPort } from './ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryEntry } from './ports/clinical-encounter-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from './ports/clinical-encounter-directory.port.js';
import type { NutritionistDirectoryEntry } from './ports/nutritionist-directory.port.js';
import type { NutritionistDirectoryPort } from './ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryEntry } from './ports/patient-clinical-directory.port.js';
import type { PatientClinicalDirectoryPort } from './ports/patient-clinical-directory.port.js';
import type { TenantDirectoryEntry } from './ports/tenant-directory.port.js';
import type { TenantDirectoryPort } from './ports/tenant-directory.port.js';

export interface NutritionDiagnosisCreationContextRequest {
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
}

export interface NutritionDiagnosisCreationContextErrors {
  tenantNotFound: (tenantId: string) => Error;
  tenantInactive: (tenantId: string) => Error;
  patientNotFound: (tenantId: string, patientId: string) => Error;
  patientInactive: (tenantId: string, patientId: string) => Error;
  nutritionistNotFound: (tenantId: string, nutritionistId: string) => Error;
  nutritionistInactive: (tenantId: string, nutritionistId: string) => Error;
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

export class NutritionDiagnosisCreationContext {
  readonly tenant: TenantDirectoryEntry;
  readonly patient: PatientClinicalDirectoryEntry;
  readonly createdByNutritionist: NutritionistDirectoryEntry;
  readonly responsibleNutritionist: NutritionistDirectoryEntry;
  readonly originClinicalEncounter: ClinicalEncounterDirectoryEntry | null;
  readonly originAnamnesis: AnamnesisDirectoryEntry | null;

  private constructor(params: {
    tenant: TenantDirectoryEntry;
    patient: PatientClinicalDirectoryEntry;
    createdByNutritionist: NutritionistDirectoryEntry;
    responsibleNutritionist: NutritionistDirectoryEntry;
    originClinicalEncounter: ClinicalEncounterDirectoryEntry | null;
    originAnamnesis: AnamnesisDirectoryEntry | null;
  }) {
    this.tenant = Object.freeze({ ...params.tenant });
    this.patient = Object.freeze({ ...params.patient });
    this.createdByNutritionist = Object.freeze({ ...params.createdByNutritionist });
    this.responsibleNutritionist = Object.freeze({ ...params.responsibleNutritionist });
    this.originClinicalEncounter = params.originClinicalEncounter
      ? Object.freeze({ ...params.originClinicalEncounter })
      : null;
    this.originAnamnesis = params.originAnamnesis
      ? Object.freeze({ ...params.originAnamnesis })
      : null;
    Object.freeze(this);
  }

  static create(params: {
    tenant: TenantDirectoryEntry;
    patient: PatientClinicalDirectoryEntry;
    createdByNutritionist: NutritionistDirectoryEntry;
    responsibleNutritionist: NutritionistDirectoryEntry;
    originClinicalEncounter: ClinicalEncounterDirectoryEntry | null;
    originAnamnesis: AnamnesisDirectoryEntry | null;
  }): NutritionDiagnosisCreationContext {
    return new NutritionDiagnosisCreationContext(params);
  }
}

export async function buildNutritionDiagnosisCreationContext(params: {
  tenantDirectory: TenantDirectoryPort;
  patientClinicalDirectory: PatientClinicalDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  clinicalEncounterDirectory: ClinicalEncounterDirectoryPort;
  anamnesisDirectory: AnamnesisDirectoryPort;
  request: NutritionDiagnosisCreationContextRequest;
  errors: NutritionDiagnosisCreationContextErrors;
}): Promise<NutritionDiagnosisCreationContext> {
  const {
    tenantId,
    patientId,
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

  let originClinicalEncounter: ClinicalEncounterDirectoryEntry | null = null;

  if (originClinicalEncounterId) {
    const encounter = await params.clinicalEncounterDirectory.findByTenantAndId(
      tenantId,
      originClinicalEncounterId,
    );

    if (!encounter) {
      throw params.errors.clinicalEncounterNotFound(
        tenantId,
        originClinicalEncounterId,
      );
    }

    if (encounter.status !== 'OPEN') {
      throw params.errors.clinicalEncounterNotOpen(
        tenantId,
        originClinicalEncounterId,
      );
    }

    if (encounter.patientId !== patientId) {
      throw params.errors.clinicalEncounterPatientMismatch(
        tenantId,
        originClinicalEncounterId,
        patientId,
      );
    }

    originClinicalEncounter = encounter;
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

  return NutritionDiagnosisCreationContext.create({
    tenant,
    patient,
    createdByNutritionist,
    responsibleNutritionist,
    originClinicalEncounter,
    originAnamnesis,
  });
}

async function resolveActiveNutritionist(
  nutritionistDirectory: NutritionistDirectoryPort,
  tenantId: string,
  nutritionistId: string,
  errors: NutritionDiagnosisCreationContextErrors,
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

export async function validateActiveNutritionistForNutritionDiagnosis(params: {
  nutritionistDirectory: NutritionistDirectoryPort;
  tenantId: string;
  nutritionistId: string;
  errors: Pick<
    NutritionDiagnosisCreationContextErrors,
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

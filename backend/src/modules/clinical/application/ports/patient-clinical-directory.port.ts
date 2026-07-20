export type PatientClinicalDirectoryStatus = 'ACTIVE' | 'INACTIVE';

export interface PatientClinicalDirectoryEntry {
  id: string;
  tenantId: string;
  status: PatientClinicalDirectoryStatus;
  birthDate: Date;
}

export interface PatientClinicalDirectoryPort {
  findByTenantAndId(
    tenantId: string,
    patientId: string,
  ): Promise<PatientClinicalDirectoryEntry | null>;
}

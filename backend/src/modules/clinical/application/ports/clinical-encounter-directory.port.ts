export type ClinicalEncounterDirectoryStatus = 'OPEN' | 'FINISHED' | 'CANCELLED';

export interface ClinicalEncounterDirectoryEntry {
  id: string;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  status: ClinicalEncounterDirectoryStatus;
}

export interface ClinicalEncounterDirectoryPort {
  findByTenantAndId(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalEncounterDirectoryEntry | null>;
}

export type AnamnesisDirectoryStatus = 'DRAFT' | 'COMPLETED';

export interface AnamnesisDirectoryEntry {
  id: string;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  status: AnamnesisDirectoryStatus;
  version: number;
}

export interface AnamnesisDirectoryPort {
  findByTenantAndId(
    tenantId: string,
    anamnesisId: string,
  ): Promise<AnamnesisDirectoryEntry | null>;
}

export type PatientDirectoryStatus = 'ACTIVE' | 'INACTIVE';

export interface PatientDirectoryEntry {
  id: string;
  tenantId: string;
  status: PatientDirectoryStatus;
}

export interface PatientDirectoryPort {
  findById(id: string): Promise<PatientDirectoryEntry | null>;
}

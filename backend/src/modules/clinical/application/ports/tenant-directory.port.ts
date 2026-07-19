export type TenantDirectoryStatus = 'ACTIVE' | 'INACTIVE';

export interface TenantDirectoryEntry {
  id: string;
  status: TenantDirectoryStatus;
}

export interface TenantDirectoryPort {
  findById(id: string): Promise<TenantDirectoryEntry | null>;
}

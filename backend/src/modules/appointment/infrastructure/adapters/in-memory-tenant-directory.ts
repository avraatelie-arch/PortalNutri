import type {
  TenantDirectoryEntry,
  TenantDirectoryPort,
} from '../../application/ports/tenant-directory.port.js';

export class InMemoryTenantDirectory implements TenantDirectoryPort {
  private readonly entries = new Map<string, TenantDirectoryEntry>();

  seed(entry: TenantDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findById(id: string): Promise<TenantDirectoryEntry | null> {
    return this.entries.get(id) ?? null;
  }
}

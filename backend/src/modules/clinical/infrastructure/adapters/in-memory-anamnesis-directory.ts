import type {
  AnamnesisDirectoryEntry,
  AnamnesisDirectoryPort,
} from '../../application/ports/anamnesis-directory.port.js';

export class InMemoryAnamnesisDirectory implements AnamnesisDirectoryPort {
  private readonly entries = new Map<string, AnamnesisDirectoryEntry>();

  seed(entry: AnamnesisDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findByTenantAndId(
    tenantId: string,
    anamnesisId: string,
  ): Promise<AnamnesisDirectoryEntry | null> {
    const entry = this.entries.get(anamnesisId);

    if (!entry || entry.tenantId !== tenantId) {
      return null;
    }

    return entry;
  }
}

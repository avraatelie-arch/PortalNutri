import type {
  ClinicalEncounterDirectoryEntry,
  ClinicalEncounterDirectoryPort,
} from '../../application/ports/clinical-encounter-directory.port.js';

export class InMemoryClinicalEncounterDirectory
  implements ClinicalEncounterDirectoryPort
{
  private readonly entries = new Map<string, ClinicalEncounterDirectoryEntry>();

  seed(entry: ClinicalEncounterDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findByTenantAndId(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalEncounterDirectoryEntry | null> {
    const entry = this.entries.get(clinicalEncounterId);

    if (!entry || entry.tenantId !== tenantId) {
      return null;
    }

    return entry;
  }
}

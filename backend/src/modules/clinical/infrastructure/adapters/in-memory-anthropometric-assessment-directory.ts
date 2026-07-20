import type {
  AnthropometricAssessmentDirectoryEntry,
  AnthropometricAssessmentDirectoryPort,
} from '../../application/ports/anthropometric-assessment-directory.port.js';

export class InMemoryAnthropometricAssessmentDirectory
  implements AnthropometricAssessmentDirectoryPort
{
  private readonly entries = new Map<string, AnthropometricAssessmentDirectoryEntry>();

  seed(entry: AnthropometricAssessmentDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findByTenantAndId(
    tenantId: string,
    anthropometricAssessmentId: string,
  ): Promise<AnthropometricAssessmentDirectoryEntry | null> {
    const entry = this.entries.get(anthropometricAssessmentId);

    if (!entry || entry.tenantId !== tenantId) {
      return null;
    }

    return entry;
  }
}

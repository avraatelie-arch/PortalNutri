import type {
  PatientClinicalDirectoryEntry,
  PatientClinicalDirectoryPort,
} from '../../application/ports/patient-clinical-directory.port.js';

export class InMemoryPatientClinicalDirectory
  implements PatientClinicalDirectoryPort
{
  private readonly entries = new Map<string, PatientClinicalDirectoryEntry>();

  seed(entry: PatientClinicalDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findByTenantAndId(
    tenantId: string,
    patientId: string,
  ): Promise<PatientClinicalDirectoryEntry | null> {
    const entry = this.entries.get(patientId);

    if (!entry || entry.tenantId !== tenantId) {
      return null;
    }

    return entry;
  }
}

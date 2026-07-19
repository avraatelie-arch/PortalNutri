import type {
  PatientDirectoryEntry,
  PatientDirectoryPort,
} from '../../application/ports/patient-directory.port.js';

export class InMemoryPatientDirectory implements PatientDirectoryPort {
  private readonly entries = new Map<string, PatientDirectoryEntry>();

  seed(entry: PatientDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findById(id: string): Promise<PatientDirectoryEntry | null> {
    return this.entries.get(id) ?? null;
  }
}

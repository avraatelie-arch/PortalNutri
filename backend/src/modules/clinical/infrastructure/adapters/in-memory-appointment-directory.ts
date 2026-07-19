import type {
  AppointmentDirectoryEntry,
  AppointmentDirectoryPort,
} from '../../application/ports/appointment-directory.port.js';

export class InMemoryAppointmentDirectory implements AppointmentDirectoryPort {
  private readonly entries = new Map<string, AppointmentDirectoryEntry>();

  seed(entry: AppointmentDirectoryEntry): void {
    this.entries.set(entry.id, entry);
  }

  async findByTenantAndId(
    tenantId: string,
    appointmentId: string,
  ): Promise<AppointmentDirectoryEntry | null> {
    const entry = this.entries.get(appointmentId);

    if (!entry || entry.tenantId !== tenantId) {
      return null;
    }

    return entry;
  }
}

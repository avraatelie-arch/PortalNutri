export type AppointmentDirectoryStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface AppointmentDirectoryEntry {
  id: string;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  status: AppointmentDirectoryStatus;
}

export interface AppointmentDirectoryPort {
  findByTenantAndId(
    tenantId: string,
    appointmentId: string,
  ): Promise<AppointmentDirectoryEntry | null>;
}

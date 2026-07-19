export interface UpdateAppointmentNotesRequest {
  tenantId: string;
  appointmentId: string;
  notes?: string | null;
}

export class UpdateAppointmentNotesCommand {
  constructor(readonly request: UpdateAppointmentNotesRequest) {}
}

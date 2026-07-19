export interface MarkAppointmentNoShowRequest {
  tenantId: string;
  appointmentId: string;
}

export class MarkAppointmentNoShowCommand {
  constructor(readonly request: MarkAppointmentNoShowRequest) {}
}

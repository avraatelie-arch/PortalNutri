export interface ConfirmAppointmentRequest {
  tenantId: string;
  appointmentId: string;
}

export class ConfirmAppointmentCommand {
  constructor(readonly request: ConfirmAppointmentRequest) {}
}

export interface CancelAppointmentRequest {
  tenantId: string;
  appointmentId: string;
  reason: string;
}

export class CancelAppointmentCommand {
  constructor(readonly request: CancelAppointmentRequest) {}
}

export interface CompleteAppointmentRequest {
  tenantId: string;
  appointmentId: string;
}

export class CompleteAppointmentCommand {
  constructor(readonly request: CompleteAppointmentRequest) {}
}

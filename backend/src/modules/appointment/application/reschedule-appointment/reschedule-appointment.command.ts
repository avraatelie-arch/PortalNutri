export interface RescheduleAppointmentRequest {
  tenantId: string;
  appointmentId: string;
  startsAt: string;
  endsAt: string;
}

export class RescheduleAppointmentCommand {
  constructor(readonly request: RescheduleAppointmentRequest) {}
}

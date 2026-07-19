export interface FindAppointmentRequest {
  tenantId: string;
  appointmentId: string;
}

export class FindAppointmentQuery {
  constructor(readonly request: FindAppointmentRequest) {}
}

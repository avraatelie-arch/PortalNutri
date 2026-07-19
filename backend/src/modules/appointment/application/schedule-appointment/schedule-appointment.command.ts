export interface ScheduleAppointmentRequest {
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  startsAt: string;
  endsAt: string;
  mode: string;
  notes?: string | null;
}

export class ScheduleAppointmentCommand {
  constructor(readonly request: ScheduleAppointmentRequest) {}
}

export interface StartClinicalEncounterRequest {
  tenantId: string;
  appointmentId?: string | null;
  patientId: string;
  nutritionistId: string;
  type: string;
  notes?: string | null;
}

export class StartClinicalEncounterCommand {
  constructor(readonly request: StartClinicalEncounterRequest) {}
}

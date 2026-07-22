export interface EditOutcomeTrackingRequest {
  tenantId: string;
  outcomeTrackingId: string;
  outcomeAssessment?: string | null;
  adherenceFactor?: string | null;
  professionalRationale?: string | null;
  clinicalNotes?: string | null;
  evaluatedAt?: string | null;
}

export class EditOutcomeTrackingCommand {
  constructor(readonly request: EditOutcomeTrackingRequest) {}
}

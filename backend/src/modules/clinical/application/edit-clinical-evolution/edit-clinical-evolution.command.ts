export interface EditClinicalEvolutionRequest {
  tenantId: string;
  clinicalEvolutionId: string;
  subjectiveEvolution?: string | null;
  professionalObservations?: string | null;
  treatmentResponse?: string | null;
  adherenceAndBarriers?: string | null;
  adverseEventsNotes?: string | null;
  nextClinicalConsiderations?: string | null;
}

export class EditClinicalEvolutionCommand {
  constructor(readonly request: EditClinicalEvolutionRequest) {}
}

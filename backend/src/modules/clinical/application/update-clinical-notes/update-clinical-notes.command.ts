export interface UpdateClinicalNotesRequest {
  tenantId: string;
  encounterId: string;
  notes?: string | null;
}

export class UpdateClinicalNotesCommand {
  constructor(readonly request: UpdateClinicalNotesRequest) {}
}

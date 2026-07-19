export interface CancelClinicalEncounterRequest {
  tenantId: string;
  encounterId: string;
}

export class CancelClinicalEncounterCommand {
  constructor(readonly request: CancelClinicalEncounterRequest) {}
}

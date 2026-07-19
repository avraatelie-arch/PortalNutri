export interface FinishClinicalEncounterRequest {
  tenantId: string;
  encounterId: string;
}

export class FinishClinicalEncounterCommand {
  constructor(readonly request: FinishClinicalEncounterRequest) {}
}

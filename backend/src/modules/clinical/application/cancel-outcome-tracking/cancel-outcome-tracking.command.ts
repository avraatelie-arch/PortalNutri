export interface CancelOutcomeTrackingRequest {
  tenantId: string;
  outcomeTrackingId: string;
}

export class CancelOutcomeTrackingCommand {
  constructor(readonly request: CancelOutcomeTrackingRequest) {}
}

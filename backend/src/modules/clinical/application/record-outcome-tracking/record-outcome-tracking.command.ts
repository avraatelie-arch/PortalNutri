export interface RecordOutcomeTrackingRequest {
  tenantId: string;
  outcomeTrackingId: string;
}

export class RecordOutcomeTrackingCommand {
  constructor(readonly request: RecordOutcomeTrackingRequest) {}
}

export interface FindOutcomeTrackingRequest {
  tenantId: string;
  outcomeTrackingId: string;
}

export class FindOutcomeTrackingQuery {
  constructor(readonly request: FindOutcomeTrackingRequest) {}
}

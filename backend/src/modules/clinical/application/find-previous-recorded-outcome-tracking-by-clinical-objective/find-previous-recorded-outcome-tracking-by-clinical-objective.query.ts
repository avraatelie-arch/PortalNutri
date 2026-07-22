export interface FindPreviousRecordedOutcomeTrackingByClinicalObjectiveRequest {
  tenantId: string;
  outcomeTrackingId: string;
}

export class FindPreviousRecordedOutcomeTrackingByClinicalObjectiveQuery {
  constructor(
    readonly request: FindPreviousRecordedOutcomeTrackingByClinicalObjectiveRequest,
  ) {}
}

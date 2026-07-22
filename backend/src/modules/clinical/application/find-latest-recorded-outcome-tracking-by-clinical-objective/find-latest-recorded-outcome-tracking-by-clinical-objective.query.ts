export interface FindLatestRecordedOutcomeTrackingByClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
}

export class FindLatestRecordedOutcomeTrackingByClinicalObjectiveQuery {
  constructor(
    readonly request: FindLatestRecordedOutcomeTrackingByClinicalObjectiveRequest,
  ) {}
}

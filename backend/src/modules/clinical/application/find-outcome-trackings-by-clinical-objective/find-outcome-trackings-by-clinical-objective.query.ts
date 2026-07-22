import type { OutcomeTrackingStatus } from '../../domain/value-objects/outcome-tracking-status.js';

export interface FindOutcomeTrackingsByClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
  statuses?: OutcomeTrackingStatus[];
}

export class FindOutcomeTrackingsByClinicalObjectiveQuery {
  constructor(readonly request: FindOutcomeTrackingsByClinicalObjectiveRequest) {}
}

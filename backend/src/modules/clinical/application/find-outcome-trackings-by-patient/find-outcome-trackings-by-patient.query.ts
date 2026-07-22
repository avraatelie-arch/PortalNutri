import type { OutcomeTrackingStatus } from '../../domain/value-objects/outcome-tracking-status.js';

export interface FindOutcomeTrackingsByPatientRequest {
  tenantId: string;
  patientId: string;
  statuses?: OutcomeTrackingStatus[];
  clinicalObjectiveId?: string;
}

export class FindOutcomeTrackingsByPatientQuery {
  constructor(readonly request: FindOutcomeTrackingsByPatientRequest) {}
}

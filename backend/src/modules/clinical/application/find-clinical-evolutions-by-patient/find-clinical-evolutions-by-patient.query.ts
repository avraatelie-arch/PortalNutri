import type { ClinicalEvolutionStatus } from '../../domain/value-objects/clinical-evolution-status.js';

export interface FindClinicalEvolutionsByPatientRequest {
  tenantId: string;
  patientId: string;
  statuses?: ClinicalEvolutionStatus[];
}

export class FindClinicalEvolutionsByPatientQuery {
  constructor(readonly request: FindClinicalEvolutionsByPatientRequest) {}
}

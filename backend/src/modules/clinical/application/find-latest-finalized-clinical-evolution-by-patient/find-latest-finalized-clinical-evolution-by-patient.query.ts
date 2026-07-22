export interface FindLatestFinalizedClinicalEvolutionByPatientRequest {
  tenantId: string;
  patientId: string;
}

export class FindLatestFinalizedClinicalEvolutionByPatientQuery {
  constructor(readonly request: FindLatestFinalizedClinicalEvolutionByPatientRequest) {}
}

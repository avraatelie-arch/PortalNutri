export interface FindLatestPrescriptionByPatientRequest {
  tenantId: string;
  patientId: string;
}

export class FindLatestPrescriptionByPatientQuery {
  constructor(readonly request: FindLatestPrescriptionByPatientRequest) {}
}

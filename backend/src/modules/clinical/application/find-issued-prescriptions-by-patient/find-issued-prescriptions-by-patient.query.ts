export interface FindIssuedPrescriptionsByPatientRequest {
  tenantId: string;
  patientId: string;
}

export class FindIssuedPrescriptionsByPatientQuery {
  constructor(readonly request: FindIssuedPrescriptionsByPatientRequest) {}
}

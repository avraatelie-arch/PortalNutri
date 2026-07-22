export interface FindPrescriptionRequest {
  tenantId: string;
  prescriptionId: string;
}

export class FindPrescriptionQuery {
  constructor(readonly request: FindPrescriptionRequest) {}
}

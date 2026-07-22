export interface CancelPrescriptionRequest {
  tenantId: string;
  prescriptionId: string;
  cancellationReason?: string | null;
}

export class CancelPrescriptionCommand {
  constructor(readonly request: CancelPrescriptionRequest) {}
}

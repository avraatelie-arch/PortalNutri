export interface EmitPrescriptionRequest {
  tenantId: string;
  prescriptionId: string;
}

export class EmitPrescriptionCommand {
  constructor(readonly request: EmitPrescriptionRequest) {}
}

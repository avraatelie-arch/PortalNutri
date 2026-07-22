import type { PrescriptionStatus } from '../../domain/value-objects/prescription-status.js';

export interface FindPrescriptionsByPatientRequest {
  tenantId: string;
  patientId: string;
  status?: PrescriptionStatus;
}

export class FindPrescriptionsByPatientQuery {
  constructor(readonly request: FindPrescriptionsByPatientRequest) {}
}

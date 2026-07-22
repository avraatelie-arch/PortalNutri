import type { PrescriptionLineRequest } from '../create-prescription/create-prescription.command.js';

export interface EditPrescriptionRequest {
  tenantId: string;
  prescriptionId: string;
  title?: string;
  clinicalNotes?: string | null;
  patientInstructions?: string | null;
  lines?: PrescriptionLineRequest[];
}

export class EditPrescriptionCommand {
  constructor(readonly request: EditPrescriptionRequest) {}
}

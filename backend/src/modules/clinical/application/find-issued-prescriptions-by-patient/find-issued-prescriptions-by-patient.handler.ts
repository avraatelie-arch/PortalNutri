import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { PrescriptionStatusValue } from '../../domain/value-objects/prescription-status.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { toPrescriptionResult, type PrescriptionResult } from '../prescription-result.js';
import { FindIssuedPrescriptionsByPatientQuery } from './find-issued-prescriptions-by-patient.query.js';

export class FindIssuedPrescriptionsByPatientHandler {
  constructor(private readonly prescriptionRepository: PrescriptionRepository) {}

  async execute(
    query: FindIssuedPrescriptionsByPatientQuery,
  ): Promise<PrescriptionResult[]> {
    return executePrescriptionUseCase(async () => {
      const { tenantId, patientId } = query.request;

      const prescriptions = await this.prescriptionRepository.findByPatient(
        tenantId,
        patientId,
        [PrescriptionStatusValue.Issued],
      );

      return prescriptions.map(toPrescriptionResult);
    });
  }
}

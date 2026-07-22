import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { toPrescriptionResult, type PrescriptionResult } from '../prescription-result.js';
import { FindPrescriptionsByPatientQuery } from './find-prescriptions-by-patient.query.js';

export class FindPrescriptionsByPatientHandler {
  constructor(private readonly prescriptionRepository: PrescriptionRepository) {}

  async execute(
    query: FindPrescriptionsByPatientQuery,
  ): Promise<PrescriptionResult[]> {
    return executePrescriptionUseCase(async () => {
      const { tenantId, patientId, status } = query.request;

      const prescriptions = await this.prescriptionRepository.findByPatient(
        tenantId,
        patientId,
        status ? [status] : undefined,
      );

      return prescriptions.map(toPrescriptionResult);
    });
  }
}

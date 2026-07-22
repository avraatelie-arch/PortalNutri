import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { toPrescriptionResult, type PrescriptionResult } from '../prescription-result.js';
import { FindLatestPrescriptionByPatientQuery } from './find-latest-prescription-by-patient.query.js';

export class FindLatestPrescriptionByPatientHandler {
  constructor(private readonly prescriptionRepository: PrescriptionRepository) {}

  async execute(
    query: FindLatestPrescriptionByPatientQuery,
  ): Promise<PrescriptionResult | null> {
    return executePrescriptionUseCase(async () => {
      const { tenantId, patientId } = query.request;

      const prescription = await this.prescriptionRepository.findLatestByPatient(
        tenantId,
        patientId,
      );

      return prescription ? toPrescriptionResult(prescription) : null;
    });
  }
}

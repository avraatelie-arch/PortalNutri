import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { loadTenantScopedPrescription } from '../load-tenant-scoped-prescription.js';
import { toPrescriptionResult, type PrescriptionResult } from '../prescription-result.js';
import { FindPrescriptionQuery } from './find-prescription.query.js';

export class FindPrescriptionHandler {
  constructor(private readonly prescriptionRepository: PrescriptionRepository) {}

  async execute(query: FindPrescriptionQuery): Promise<PrescriptionResult> {
    return executePrescriptionUseCase(async () => {
      const { tenantId, prescriptionId } = query.request;

      const prescription = await loadTenantScopedPrescription(
        this.prescriptionRepository,
        tenantId,
        prescriptionId,
      );

      return toPrescriptionResult(prescription);
    });
  }
}

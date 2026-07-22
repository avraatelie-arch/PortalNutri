import type { Prescription } from '../domain/aggregates/prescription.aggregate.js';
import type { PrescriptionRepository } from '../domain/repositories/prescription-repository.js';
import { PrescriptionId } from '../domain/value-objects/prescription-id.js';
import { PrescriptionNotFoundError } from './errors/prescription-not-found.error.js';

export async function loadTenantScopedPrescription(
  repository: PrescriptionRepository,
  tenantId: string,
  prescriptionId: string,
): Promise<Prescription> {
  const prescription = await repository.findByTenantAndId(
    tenantId,
    PrescriptionId.create(prescriptionId),
  );

  if (!prescription) {
    throw new PrescriptionNotFoundError(tenantId, prescriptionId);
  }

  return prescription;
}

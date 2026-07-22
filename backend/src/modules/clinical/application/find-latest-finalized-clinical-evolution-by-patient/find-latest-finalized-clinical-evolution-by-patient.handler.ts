import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import {
  toClinicalEvolutionResult,
  type ClinicalEvolutionResult,
} from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { FindLatestFinalizedClinicalEvolutionByPatientQuery } from './find-latest-finalized-clinical-evolution-by-patient.query.js';

export class FindLatestFinalizedClinicalEvolutionByPatientHandler {
  constructor(private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository) {}

  async execute(
    query: FindLatestFinalizedClinicalEvolutionByPatientQuery,
  ): Promise<ClinicalEvolutionResult | null> {
    return executeClinicalUseCase(async () => {
      const { tenantId, patientId } = query.request;

      const evolution =
        await this.clinicalEvolutionRepository.findLatestFinalizedByPatient(
          tenantId,
          patientId,
        );

      return evolution ? toClinicalEvolutionResult(evolution) : null;
    });
  }
}

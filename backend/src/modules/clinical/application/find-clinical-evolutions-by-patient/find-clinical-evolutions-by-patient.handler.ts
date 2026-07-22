import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import {
  toClinicalEvolutionResult,
  type ClinicalEvolutionResult,
} from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { FindClinicalEvolutionsByPatientQuery } from './find-clinical-evolutions-by-patient.query.js';

export class FindClinicalEvolutionsByPatientHandler {
  constructor(private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository) {}

  async execute(
    query: FindClinicalEvolutionsByPatientQuery,
  ): Promise<ClinicalEvolutionResult[]> {
    return executeClinicalUseCase(async () => {
      const { tenantId, patientId, statuses } = query.request;

      const evolutions = await this.clinicalEvolutionRepository.findByPatient(
        tenantId,
        patientId,
        statuses,
      );

      return evolutions.map(toClinicalEvolutionResult);
    });
  }
}

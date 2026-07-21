import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import {
  toClinicalObjectiveResult,
  type ClinicalObjectiveResult,
} from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { FindActiveClinicalObjectivesByPatientQuery } from './find-active-clinical-objectives-by-patient.query.js';

export class FindActiveClinicalObjectivesByPatientHandler {
  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
  ) {}

  async execute(
    query: FindActiveClinicalObjectivesByPatientQuery,
  ): Promise<ClinicalObjectiveResult[]> {
    return executeClinicalObjectiveUseCase(async () => {
      const { tenantId, patientId } = query.request;

      const objectives =
        await this.clinicalObjectiveRepository.findActiveByPatient(
          tenantId,
          patientId,
        );

      return objectives.map(toClinicalObjectiveResult);
    });
  }
}

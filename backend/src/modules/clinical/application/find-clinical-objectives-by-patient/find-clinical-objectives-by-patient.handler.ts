import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { parseClinicalObjectiveStatus } from '../../domain/value-objects/clinical-objective-status.js';
import {
  toClinicalObjectiveResult,
  type ClinicalObjectiveResult,
} from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { FindClinicalObjectivesByPatientQuery } from './find-clinical-objectives-by-patient.query.js';

export class FindClinicalObjectivesByPatientHandler {
  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
  ) {}

  async execute(
    query: FindClinicalObjectivesByPatientQuery,
  ): Promise<ClinicalObjectiveResult[]> {
    return executeClinicalObjectiveUseCase(async () => {
      const { tenantId, patientId, status } = query.request;

      const objectives = await this.clinicalObjectiveRepository.findByPatient(
        tenantId,
        patientId,
        status ? [parseClinicalObjectiveStatus(status)] : undefined,
      );

      return objectives.map(toClinicalObjectiveResult);
    });
  }
}

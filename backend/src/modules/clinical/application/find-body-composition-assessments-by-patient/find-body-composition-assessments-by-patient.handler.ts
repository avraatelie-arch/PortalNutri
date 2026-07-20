import type { BodyCompositionAssessmentRepository } from '../../domain/repositories/body-composition-assessment-repository.js';
import {
  toBodyCompositionAssessmentResult,
  type BodyCompositionAssessmentResult,
} from '../body-composition-assessment-result.js';
import { executeBodyCompositionUseCase } from '../execute-body-composition-use-case.js';
import { FindBodyCompositionAssessmentsByPatientQuery } from './find-body-composition-assessments-by-patient.query.js';

export class FindBodyCompositionAssessmentsByPatientHandler {
  constructor(
    private readonly bodyCompositionAssessmentRepository: BodyCompositionAssessmentRepository,
  ) {}

  async execute(
    query: FindBodyCompositionAssessmentsByPatientQuery,
  ): Promise<BodyCompositionAssessmentResult[]> {
    return executeBodyCompositionUseCase(async () => {
      const { tenantId, patientId, measuredFrom, measuredTo } = query.request;

      const assessments =
        await this.bodyCompositionAssessmentRepository.findByPatient(
          tenantId,
          patientId,
          {
            from: measuredFrom,
            to: measuredTo,
          },
        );

      return assessments.map(toBodyCompositionAssessmentResult);
    });
  }
}

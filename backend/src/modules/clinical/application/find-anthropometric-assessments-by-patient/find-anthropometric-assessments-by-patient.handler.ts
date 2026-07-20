import type { AnthropometricAssessmentRepository } from '../../domain/repositories/anthropometric-assessment-repository.js';
import {
  toAnthropometricAssessmentResult,
  type AnthropometricAssessmentResult,
} from '../anthropometric-assessment-result.js';
import { executeAnthropometryUseCase } from '../execute-anthropometry-use-case.js';
import { FindAnthropometricAssessmentsByPatientQuery } from './find-anthropometric-assessments-by-patient.query.js';

export class FindAnthropometricAssessmentsByPatientHandler {
  constructor(
    private readonly anthropometricAssessmentRepository: AnthropometricAssessmentRepository,
  ) {}

  async execute(
    query: FindAnthropometricAssessmentsByPatientQuery,
  ): Promise<AnthropometricAssessmentResult[]> {
    return executeAnthropometryUseCase(async () => {
      const { tenantId, patientId, measuredFrom, measuredTo } = query.request;

      const assessments =
        await this.anthropometricAssessmentRepository.findByPatient(
          tenantId,
          patientId,
          {
            from: measuredFrom,
            to: measuredTo,
          },
        );

      return assessments.map(toAnthropometricAssessmentResult);
    });
  }
}

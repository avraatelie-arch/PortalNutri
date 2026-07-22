import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import {
  toOutcomeTrackingResult,
  type OutcomeTrackingResult,
} from '../outcome-tracking-result.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { FindOutcomeTrackingsByPatientQuery } from './find-outcome-trackings-by-patient.query.js';

export class FindOutcomeTrackingsByPatientHandler {
  constructor(private readonly outcomeTrackingRepository: OutcomeTrackingRepository) {}

  async execute(
    query: FindOutcomeTrackingsByPatientQuery,
  ): Promise<OutcomeTrackingResult[]> {
    return executeOutcomeTrackingUseCase(async () => {
      const { tenantId, patientId, statuses, clinicalObjectiveId } = query.request;

      const trackings = await this.outcomeTrackingRepository.findByPatient(
        tenantId,
        patientId,
        statuses,
        clinicalObjectiveId,
      );

      return trackings.map(toOutcomeTrackingResult);
    });
  }
}

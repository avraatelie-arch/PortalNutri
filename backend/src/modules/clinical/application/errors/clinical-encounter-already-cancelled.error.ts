import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterAlreadyCancelledError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_ALREADY_CANCELLED' as const;

  constructor(readonly encounterId: string) {
    super(`Clinical encounter with id "${encounterId}" is already cancelled.`);
    this.name = 'ClinicalEncounterAlreadyCancelledError';
  }
}

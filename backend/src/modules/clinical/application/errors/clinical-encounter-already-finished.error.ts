import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterAlreadyFinishedError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_ALREADY_FINISHED' as const;

  constructor(readonly encounterId: string) {
    super(`Clinical encounter with id "${encounterId}" is already finished.`);
    this.name = 'ClinicalEncounterAlreadyFinishedError';
  }
}

import { ApplicationError } from './application-error.js';

export class PersonInactiveError extends ApplicationError {
  readonly code = 'PERSON_INACTIVE' as const;

  constructor(readonly personId: string) {
    super(`Person with id "${personId}" is inactive.`);
    this.name = 'PersonInactiveError';
  }
}

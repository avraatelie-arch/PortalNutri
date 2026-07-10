import { ApplicationError } from './application-error.js';

export class PersonNotFoundError extends ApplicationError {
  readonly code = 'PERSON_NOT_FOUND' as const;

  constructor(readonly personId: string) {
    super(`Person with id "${personId}" was not found.`);
    this.name = 'PersonNotFoundError';
  }
}

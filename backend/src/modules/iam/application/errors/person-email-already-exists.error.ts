import { ApplicationError } from './application-error.js';

export class PersonEmailAlreadyExistsError extends ApplicationError {
  readonly code = 'PERSON_EMAIL_ALREADY_EXISTS' as const;

  constructor(readonly email: string) {
    super(`Email "${email}" is already registered.`);
    this.name = 'PersonEmailAlreadyExistsError';
  }
}

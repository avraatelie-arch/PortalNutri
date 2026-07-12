import { ApplicationError } from './application-error.js';

export class CredentialAlreadyExistsError extends ApplicationError {
  readonly code = 'CREDENTIAL_ALREADY_EXISTS' as const;

  constructor(readonly personId: string) {
    super(`Credential for person "${personId}" already exists.`);
    this.name = 'CredentialAlreadyExistsError';
  }
}

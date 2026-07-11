import { ApplicationError } from './application-error.js';

export class PersonDocumentAlreadyExistsError extends ApplicationError {
  readonly code = 'PERSON_DOCUMENT_ALREADY_EXISTS' as const;

  constructor(
    readonly documentType: string,
    readonly documentValue: string,
  ) {
    super(
      `Document "${documentType}:${documentValue}" is already registered.`,
    );
    this.name = 'PersonDocumentAlreadyExistsError';
  }
}

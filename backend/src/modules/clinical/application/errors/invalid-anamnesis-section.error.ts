import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class InvalidAnamnesisSectionError extends ApplicationError {
  readonly code = 'INVALID_ANAMNESIS_SECTION' as const;

  constructor(readonly section: string) {
    super(`Invalid anamnesis section: "${section}".`);
    this.name = 'InvalidAnamnesisSectionError';
  }
}

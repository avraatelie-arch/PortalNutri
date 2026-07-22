import { DomainError } from './domain-error.js';

export class PrescriptionDuplicateLineDescriptionDomainError extends DomainError {
  constructor() {
    super('Prescription lines must not contain duplicate normalized descriptions.');
    this.name = 'PrescriptionDuplicateLineDescriptionDomainError';
  }
}

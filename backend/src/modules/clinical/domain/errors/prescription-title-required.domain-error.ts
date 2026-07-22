import { DomainError } from './domain-error.js';

export class PrescriptionTitleRequiredDomainError extends DomainError {
  constructor() {
    super('Prescription title is required to emit.');
    this.name = 'PrescriptionTitleRequiredDomainError';
  }
}

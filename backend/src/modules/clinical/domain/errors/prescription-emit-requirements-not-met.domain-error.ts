import { DomainError } from './domain-error.js';

export class PrescriptionEmitRequirementsNotMetDomainError extends DomainError {
  constructor() {
    super('Prescription emit requirements are not met.');
    this.name = 'PrescriptionEmitRequirementsNotMetDomainError';
  }
}

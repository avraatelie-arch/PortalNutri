import { DomainError } from './domain-error.js';

export class PrescriptionTerminalDomainError extends DomainError {
  constructor(readonly status: string) {
    super(`Prescription in terminal status ${status} cannot be mutated.`);
    this.name = 'PrescriptionTerminalDomainError';
  }
}

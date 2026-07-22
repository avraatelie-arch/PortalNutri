import { DomainError } from './domain-error.js';

export const PRESCRIPTION_MAX_LINES = 20;

export class PrescriptionMaxLinesExceededDomainError extends DomainError {
  constructor() {
    super(`Prescription cannot exceed ${PRESCRIPTION_MAX_LINES} lines.`);
    this.name = 'PrescriptionMaxLinesExceededDomainError';
  }
}

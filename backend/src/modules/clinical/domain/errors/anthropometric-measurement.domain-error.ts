import { DomainError } from './domain-error.js';

export class AnthropometricMeasurementDomainError extends DomainError {
  constructor(
    readonly fieldName: string,
    reason: string,
  ) {
    super(`Invalid ${fieldName}: ${reason}`);
    this.name = 'AnthropometricMeasurementDomainError';
  }
}

import { DomainError } from './domain-error.js';

export class DoseCustomDisplayRequiredDomainError extends DomainError {
  constructor() {
    super('Custom display is required when dose unit is OTHER.');
    this.name = 'DoseCustomDisplayRequiredDomainError';
  }
}

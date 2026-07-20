import { DomainError } from './domain-error.js';

export class AnamnesisIncompleteDomainError extends DomainError {
  constructor() {
    super('Anamnesis cannot be completed.');
    this.name = 'AnamnesisIncompleteDomainError';
  }
}

export class AnamnesisAlreadyCompletedDomainError extends DomainError {
  constructor() {
    super('Anamnesis is already completed.');
    this.name = 'AnamnesisAlreadyCompletedDomainError';
  }
}

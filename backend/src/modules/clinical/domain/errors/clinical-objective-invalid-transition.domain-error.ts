import { DomainError } from './domain-error.js';

export class ClinicalObjectiveInvalidTransitionDomainError extends DomainError {
  constructor(fromStatus: string, action: string) {
    super(`Cannot ${action} clinical objective in status ${fromStatus}.`);
    this.name = 'ClinicalObjectiveInvalidTransitionDomainError';
  }
}

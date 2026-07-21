import { DomainError } from './domain-error.js';

export class NutritionDiagnosisInterpretationRequiredDomainError extends DomainError {
  constructor() {
    super('Professional interpretation is required to confirm a nutrition diagnosis.');
    this.name = 'NutritionDiagnosisInterpretationRequiredDomainError';
  }
}

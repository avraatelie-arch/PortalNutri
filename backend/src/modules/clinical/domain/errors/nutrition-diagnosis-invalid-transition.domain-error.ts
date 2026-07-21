import { DomainError } from './domain-error.js';
import type { NutritionDiagnosisStatus } from '../value-objects/nutrition-diagnosis-status.js';

export class NutritionDiagnosisInvalidTransitionDomainError extends DomainError {
  constructor(
    readonly status: NutritionDiagnosisStatus,
    readonly action: string,
  ) {
    super(
      `Cannot ${action} nutrition diagnosis in status ${status}.`,
    );
    this.name = 'NutritionDiagnosisInvalidTransitionDomainError';
  }
}

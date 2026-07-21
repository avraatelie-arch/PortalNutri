import { DomainError } from './domain-error.js';
import type { NutritionDiagnosisStatus } from '../value-objects/nutrition-diagnosis-status.js';

export class NutritionDiagnosisTerminalDomainError extends DomainError {
  constructor(readonly status: NutritionDiagnosisStatus) {
    super(`Nutrition diagnosis in terminal status ${status} cannot be modified.`);
    this.name = 'NutritionDiagnosisTerminalDomainError';
  }
}

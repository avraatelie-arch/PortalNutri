import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class NutritionDiagnosisId {
  private constructor(private readonly value: string) {}

  static create(value: string): NutritionDiagnosisId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Nutrition diagnosis id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Nutrition diagnosis id must be a valid UUID.');
    }

    return new NutritionDiagnosisId(normalized);
  }

  static generate(): NutritionDiagnosisId {
    return new NutritionDiagnosisId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}

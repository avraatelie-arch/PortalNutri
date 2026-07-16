import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class NutritionistId {
  private constructor(private readonly value: string) {}

  static create(value: string): NutritionistId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('NutritionistId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('NutritionistId must be a valid UUID.');
    }

    return new NutritionistId(normalized);
  }

  static generate(): NutritionistId {
    return new NutritionistId(crypto.randomUUID());
  }

  equals(other: NutritionistId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

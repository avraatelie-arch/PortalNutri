import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ClinicalEvolutionId {
  private constructor(private readonly value: string) {}

  static create(value: string): ClinicalEvolutionId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Clinical evolution id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Clinical evolution id must be a valid UUID.');
    }

    return new ClinicalEvolutionId(normalized);
  }

  static generate(): ClinicalEvolutionId {
    return new ClinicalEvolutionId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}

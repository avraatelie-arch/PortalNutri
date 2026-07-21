import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ClinicalObjectiveId {
  private constructor(private readonly value: string) {}

  static create(value: string): ClinicalObjectiveId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Clinical objective id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Clinical objective id must be a valid UUID.');
    }

    return new ClinicalObjectiveId(normalized);
  }

  static generate(): ClinicalObjectiveId {
    return new ClinicalObjectiveId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}

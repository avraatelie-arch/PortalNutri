import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ClinicalEncounterId {
  private constructor(private readonly value: string) {}

  static create(value: string): ClinicalEncounterId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Clinical encounter id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Clinical encounter id must be a valid UUID.');
    }

    return new ClinicalEncounterId(normalized);
  }

  static generate(): ClinicalEncounterId {
    return new ClinicalEncounterId(randomUUID());
  }

  equals(other: ClinicalEncounterId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PatientId {
  private constructor(private readonly value: string) {}

  static create(value: string): PatientId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('PatientId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('PatientId must be a valid UUID.');
    }

    return new PatientId(normalized);
  }

  static generate(): PatientId {
    return new PatientId(crypto.randomUUID());
  }

  equals(other: PatientId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

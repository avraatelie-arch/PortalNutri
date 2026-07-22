import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PrescriptionId {
  private constructor(private readonly value: string) {}

  static create(value: string): PrescriptionId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Prescription id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Prescription id must be a valid UUID.');
    }

    return new PrescriptionId(normalized);
  }

  static generate(): PrescriptionId {
    return new PrescriptionId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}

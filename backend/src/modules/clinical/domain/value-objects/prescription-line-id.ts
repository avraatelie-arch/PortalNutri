import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PrescriptionLineId {
  private constructor(private readonly value: string) {}

  static create(value: string): PrescriptionLineId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Prescription line id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Prescription line id must be a valid UUID.');
    }

    return new PrescriptionLineId(normalized);
  }

  static generate(): PrescriptionLineId {
    return new PrescriptionLineId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}

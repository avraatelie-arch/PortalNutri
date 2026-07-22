import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class OutcomeTrackingId {
  private constructor(private readonly value: string) {}

  static create(value: string): OutcomeTrackingId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Outcome tracking id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Outcome tracking id must be a valid UUID.');
    }

    return new OutcomeTrackingId(normalized);
  }

  static generate(): OutcomeTrackingId {
    return new OutcomeTrackingId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}

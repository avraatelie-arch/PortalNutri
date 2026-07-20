import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BodyCompositionAssessmentId {
  private constructor(private readonly value: string) {}

  static create(value?: string): BodyCompositionAssessmentId {
    if (value === undefined) {
      return new BodyCompositionAssessmentId(randomUUID());
    }

    const normalized = value.trim();

    if (!normalized) {
      throw new DomainError('Body composition assessment id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Body composition assessment id must be a valid UUID.');
    }

    return new BodyCompositionAssessmentId(normalized);
  }

  static generate(): BodyCompositionAssessmentId {
    return new BodyCompositionAssessmentId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}

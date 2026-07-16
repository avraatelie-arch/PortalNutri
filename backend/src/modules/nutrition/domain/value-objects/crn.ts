import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 4;

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

export class Crn {
  private constructor(private readonly value: string) {}

  static create(value: string): Crn {
    const normalized = normalize(value ?? '');

    if (!normalized) {
      throw new DomainError('Crn is required.');
    }

    if (normalized.length < MIN_LENGTH) {
      throw new DomainError(
        `Crn must have at least ${MIN_LENGTH} characters.`,
      );
    }

    return new Crn(normalized);
  }

  /**
   * Canonical form used for uniqueness checks and persistence:
   * trim → collapse internal whitespace → uppercase.
   */
  get normalizedValue(): string {
    return this.value;
  }

  equals(other: Crn): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

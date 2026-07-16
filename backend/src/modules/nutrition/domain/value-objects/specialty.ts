import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

function normalize(displayValue: string): string {
  return displayValue.normalize('NFKC').replace(/\s+/g, ' ').toLowerCase();
}

export class Specialty {
  private constructor(
    private readonly displayValue: string,
    private readonly canonicalValue: string,
  ) {}

  static create(value: string): Specialty {
    const trimmed = value?.trim();

    if (!trimmed) {
      throw new DomainError('Specialty is required.');
    }

    const collapsed = trimmed.replace(/\s+/g, ' ');

    if (collapsed.length < MIN_LENGTH) {
      throw new DomainError(
        `Specialty must have at least ${MIN_LENGTH} characters.`,
      );
    }

    if (collapsed.length > MAX_LENGTH) {
      throw new DomainError(
        `Specialty must have at most ${MAX_LENGTH} characters.`,
      );
    }

    return new Specialty(collapsed, normalize(trimmed));
  }

  get value(): string {
    return this.displayValue;
  }

  /**
   * Canonical form used for uniqueness checks and persistence:
   * trim → Unicode NFKC → collapse internal whitespace → lowercase.
   */
  get normalizedValue(): string {
    return this.canonicalValue;
  }

  equals(other: Specialty): boolean {
    return this.canonicalValue === other.canonicalValue;
  }

  toString(): string {
    return this.displayValue;
  }
}

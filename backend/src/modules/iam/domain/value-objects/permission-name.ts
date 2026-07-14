import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

function normalize(displayValue: string): string {
  return displayValue.normalize('NFKC').replace(/\s+/g, ' ').toLowerCase();
}

export class PermissionName {
  private constructor(
    private readonly displayValue: string,
    private readonly canonicalValue: string,
  ) {}

  static create(value: string): PermissionName {
    const trimmed = value?.trim();

    if (!trimmed) {
      throw new DomainError('PermissionName is required.');
    }

    const collapsed = trimmed.replace(/\s+/g, ' ');

    if (collapsed.length < MIN_LENGTH) {
      throw new DomainError(
        `PermissionName must have at least ${MIN_LENGTH} characters.`,
      );
    }

    if (collapsed.length > MAX_LENGTH) {
      throw new DomainError(
        `PermissionName must have at most ${MAX_LENGTH} characters.`,
      );
    }

    return new PermissionName(collapsed, normalize(trimmed));
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

  equals(other: PermissionName): boolean {
    return this.canonicalValue === other.canonicalValue;
  }

  toString(): string {
    return this.displayValue;
  }
}

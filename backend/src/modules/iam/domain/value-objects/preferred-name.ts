import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 1;
const MAX_LENGTH = 100;

export class PreferredName {
  private constructor(private readonly value: string) {}

  static create(value: string): PreferredName {
    const normalized = value?.trim().replace(/\s+/g, ' ');

    if (!normalized) {
      throw new DomainError('PreferredName cannot be empty.');
    }

    if (normalized.length < MIN_LENGTH) {
      throw new DomainError(
        `PreferredName must have at least ${MIN_LENGTH} character.`,
      );
    }

    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(
        `PreferredName must have at most ${MAX_LENGTH} characters.`,
      );
    }

    if (!/^[A-Za-zÀ-ÿ' -]+$/.test(normalized)) {
      throw new DomainError('PreferredName contains invalid characters.');
    }

    return new PreferredName(normalized);
  }

  static createOptional(value?: string | null): PreferredName | null {
    if (!value?.trim()) {
      return null;
    }

    return PreferredName.create(value);
  }

  equals(other: PreferredName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

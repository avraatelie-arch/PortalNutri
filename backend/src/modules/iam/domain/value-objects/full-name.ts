import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 3;
const MAX_LENGTH = 200;

export class FullName {
  private constructor(private readonly value: string) {}

  static create(value: string): FullName {
    const normalized = value?.trim().replace(/\s+/g, ' ');

    if (!normalized) {
      throw new DomainError('FullName is required.');
    }

    if (normalized.length < MIN_LENGTH) {
      throw new DomainError(
        `FullName must have at least ${MIN_LENGTH} characters.`,
      );
    }

    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(
        `FullName must have at most ${MAX_LENGTH} characters.`,
      );
    }

    if (!/^[A-Za-zÀ-ÿ' -]+$/.test(normalized)) {
      throw new DomainError('FullName contains invalid characters.');
    }

    return new FullName(normalized);
  }

  equals(other: FullName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

import { DomainError } from '../errors/domain-error.js';

export class RefreshTokenHash {
  private constructor(private readonly value: string) {}

  static fromHash(value: string): RefreshTokenHash {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('RefreshTokenHash is required.');
    }

    return new RefreshTokenHash(normalized);
  }

  equals(other: RefreshTokenHash): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

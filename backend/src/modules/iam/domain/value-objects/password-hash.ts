import { DomainError } from '../errors/domain-error.js';

export class PasswordHash {
  private constructor(private readonly value: string) {}

  static fromHash(value: string): PasswordHash {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('PasswordHash is required.');
    }

    return new PasswordHash(normalized);
  }

  equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

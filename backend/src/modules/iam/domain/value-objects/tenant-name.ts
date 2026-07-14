import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;

export class TenantName {
  private constructor(private readonly value: string) {}

  static create(value: string): TenantName {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('TenantName is required.');
    }

    if (normalized.length < MIN_LENGTH) {
      throw new DomainError(
        `TenantName must have at least ${MIN_LENGTH} characters.`,
      );
    }

    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(
        `TenantName must have at most ${MAX_LENGTH} characters.`,
      );
    }

    return new TenantName(normalized);
  }

  equals(other: TenantName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

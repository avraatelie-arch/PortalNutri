import { DomainError } from '../errors/domain-error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class TenantSlug {
  private constructor(private readonly value: string) {}

  static create(value: string): TenantSlug {
    const normalized = value?.trim().toLowerCase();

    if (!normalized) {
      throw new DomainError('TenantSlug is required.');
    }

    if (normalized.length < MIN_LENGTH) {
      throw new DomainError(
        `TenantSlug must have at least ${MIN_LENGTH} characters.`,
      );
    }

    if (normalized.length > MAX_LENGTH) {
      throw new DomainError(
        `TenantSlug must have at most ${MAX_LENGTH} characters.`,
      );
    }

    if (!SLUG_PATTERN.test(normalized)) {
      throw new DomainError(
        'TenantSlug must contain only lowercase letters, numbers, and single hyphens.',
      );
    }

    return new TenantSlug(normalized);
  }

  equals(other: TenantSlug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

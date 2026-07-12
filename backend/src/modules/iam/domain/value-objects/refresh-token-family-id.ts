import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class RefreshTokenFamilyId {
  private constructor(private readonly value: string) {}

  static create(value: string): RefreshTokenFamilyId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('RefreshTokenFamilyId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('RefreshTokenFamilyId must be a valid UUID.');
    }

    return new RefreshTokenFamilyId(normalized);
  }

  static generate(): RefreshTokenFamilyId {
    return new RefreshTokenFamilyId(crypto.randomUUID());
  }

  equals(other: RefreshTokenFamilyId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

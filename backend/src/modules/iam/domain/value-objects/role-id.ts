import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class RoleId {
  private constructor(private readonly value: string) {}

  static create(value: string): RoleId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('RoleId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('RoleId must be a valid UUID.');
    }

    return new RoleId(normalized);
  }

  static generate(): RoleId {
    return new RoleId(crypto.randomUUID());
  }

  equals(other: RoleId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

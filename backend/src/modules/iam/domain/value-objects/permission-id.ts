import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PermissionId {
  private constructor(private readonly value: string) {}

  static create(value: string): PermissionId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('PermissionId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('PermissionId must be a valid UUID.');
    }

    return new PermissionId(normalized);
  }

  static generate(): PermissionId {
    return new PermissionId(crypto.randomUUID());
  }

  equals(other: PermissionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PermissionAssignmentId {
  private constructor(private readonly value: string) {}

  static create(value: string): PermissionAssignmentId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('PermissionAssignmentId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('PermissionAssignmentId must be a valid UUID.');
    }

    return new PermissionAssignmentId(normalized);
  }

  static generate(): PermissionAssignmentId {
    return new PermissionAssignmentId(crypto.randomUUID());
  }

  equals(other: PermissionAssignmentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

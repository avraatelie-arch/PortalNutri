import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class MembershipId {
  private constructor(private readonly value: string) {}

  static create(value: string): MembershipId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('MembershipId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('MembershipId must be a valid UUID.');
    }

    return new MembershipId(normalized);
  }

  static generate(): MembershipId {
    return new MembershipId(crypto.randomUUID());
  }

  equals(other: MembershipId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class SessionId {
  private constructor(private readonly value: string) {}

  static create(value: string): SessionId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('SessionId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('SessionId must be a valid UUID.');
    }

    return new SessionId(normalized);
  }

  static generate(): SessionId {
    return new SessionId(crypto.randomUUID());
  }

  equals(other: SessionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

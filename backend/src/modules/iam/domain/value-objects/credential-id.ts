import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CredentialId {
  private constructor(private readonly value: string) {}

  static create(value: string): CredentialId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('CredentialId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError('CredentialId must be a valid UUID.');
    }

    return new CredentialId(normalized);
  }

  static generate(): CredentialId {
    return new CredentialId(crypto.randomUUID());
  }

  equals(other: CredentialId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

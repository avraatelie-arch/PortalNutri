import type { Credential } from '../../domain/aggregates/credential.aggregate.js';
import type { CredentialStatus } from '../../domain/value-objects/credential-status.js';

export interface RegisterCredentialResult {
  id: string;
  personId: string;
  status: CredentialStatus;
  createdAt: string;
}

export class RegisterCredentialResponse implements RegisterCredentialResult {
  private constructor(
    readonly id: string,
    readonly personId: string,
    readonly status: CredentialStatus,
    readonly createdAt: string,
  ) {}

  static from(credential: Credential): RegisterCredentialResponse {
    return new RegisterCredentialResponse(
      credential.getId().toString(),
      credential.getPersonId().toString(),
      credential.getStatus(),
      credential.getCreatedAt().toISOString(),
    );
  }
}

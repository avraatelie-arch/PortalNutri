import type { Credential } from '../aggregates/credential.aggregate.js';
import type { PersonId } from '../value-objects/person-id.js';

export interface CredentialRepository {
  save(credential: Credential): Promise<void>;
  findByPersonId(personId: PersonId): Promise<Credential | null>;
  existsByPersonId(personId: PersonId): Promise<boolean>;
}

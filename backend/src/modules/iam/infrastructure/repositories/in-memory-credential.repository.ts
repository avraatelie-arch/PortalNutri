import type { Credential } from '../../domain/aggregates/credential.aggregate.js';
import type { CredentialRepository } from '../../domain/repositories/credential-repository.js';
import type { PersonId } from '../../domain/value-objects/person-id.js';

export class InMemoryCredentialRepository implements CredentialRepository {
  private readonly credentials = new Map<string, Credential>();

  async save(credential: Credential): Promise<void> {
    this.credentials.set(credential.getPersonId().toString(), credential);
  }

  async findByPersonId(personId: PersonId): Promise<Credential | null> {
    return this.credentials.get(personId.toString()) ?? null;
  }

  async existsByPersonId(personId: PersonId): Promise<boolean> {
    return (await this.findByPersonId(personId)) !== null;
  }
}

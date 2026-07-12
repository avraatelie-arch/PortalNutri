import type { PrismaClient } from '@prisma/client';
import type { CredentialRepository } from '../../domain/repositories/credential-repository.js';
import type { PersonId } from '../../domain/value-objects/person-id.js';
import type { Credential } from '../../domain/aggregates/credential.aggregate.js';
import { toDomain, toPersistence } from '../prisma/prisma-credential.mapper.js';

export class PrismaCredentialRepository implements CredentialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(credential: Credential): Promise<void> {
    const data = toPersistence(credential);

    await this.prisma.credential.upsert({
      where: { personId: data.personId },
      create: data,
      update: {
        passwordHash: data.passwordHash,
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByPersonId(personId: PersonId): Promise<Credential | null> {
    const record = await this.prisma.credential.findUnique({
      where: { personId: personId.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async existsByPersonId(personId: PersonId): Promise<boolean> {
    return (await this.findByPersonId(personId)) !== null;
  }
}

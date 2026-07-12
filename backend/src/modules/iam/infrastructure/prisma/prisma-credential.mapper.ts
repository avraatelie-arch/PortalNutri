import type { Credential as CredentialRecord } from '@prisma/client';
import { CredentialStatus as PrismaCredentialStatus } from '@prisma/client';
import { Credential } from '../../domain/aggregates/credential.aggregate.js';
import { CredentialId } from '../../domain/value-objects/credential-id.js';
import { CredentialStatus } from '../../domain/value-objects/credential-status.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.js';
import { PersonId } from '../../domain/value-objects/person-id.js';

export type CredentialPersistenceInput = {
  id: string;
  personId: string;
  passwordHash: string;
  status: PrismaCredentialStatus;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(credential: Credential): CredentialPersistenceInput {
  return {
    id: credential.getId().toString(),
    personId: credential.getPersonId().toString(),
    passwordHash: credential.getPasswordHash().toString(),
    status: toPrismaCredentialStatus(credential.getStatus()),
    createdAt: credential.getCreatedAt(),
    updatedAt: credential.getUpdatedAt(),
  };
}

export function toDomain(record: CredentialRecord): Credential {
  return Credential.reconstitute({
    id: CredentialId.create(record.id),
    personId: PersonId.create(record.personId),
    passwordHash: PasswordHash.fromHash(record.passwordHash),
    status: toDomainCredentialStatus(record.status),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaCredentialStatus(status: CredentialStatus): PrismaCredentialStatus {
  return status as PrismaCredentialStatus;
}

function toDomainCredentialStatus(status: PrismaCredentialStatus): CredentialStatus {
  return status as CredentialStatus;
}

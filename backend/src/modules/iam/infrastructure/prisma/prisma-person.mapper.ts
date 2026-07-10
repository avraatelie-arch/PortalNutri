import type { Person as PersonRecord } from '@prisma/client';
import {
  DocumentType as PrismaDocumentType,
  PersonStatus as PrismaPersonStatus,
} from '@prisma/client';
import { Person } from '../../domain/aggregates/person.aggregate.js';
import { BirthDate } from '../../domain/value-objects/birth-date.js';
import { Document, DocumentType } from '../../domain/value-objects/document.js';
import { Email } from '../../domain/value-objects/email.js';
import { FullName } from '../../domain/value-objects/full-name.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { Phone } from '../../domain/value-objects/phone.js';
import { PreferredName } from '../../domain/value-objects/preferred-name.js';

export type PersonPersistenceInput = {
  id: string;
  fullName: string;
  preferredName: string | null;
  email: string;
  phone: string | null;
  document: string;
  documentType: PrismaDocumentType;
  birthDate: Date;
  status: PrismaPersonStatus;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(person: Person): PersonPersistenceInput {
  const phone = person.getPhone();
  const preferredName = person.getPreferredName();

  return {
    id: person.getId().toString(),
    fullName: person.getFullName().toString(),
    preferredName: preferredName?.toString() ?? null,
    email: person.getEmail().toString(),
    phone: phone?.toString() ?? null,
    document: person.getDocument().getValue(),
    documentType: toPrismaDocumentType(person.getDocument().getType()),
    birthDate: person.getBirthDate().toDate(),
    status: toPrismaPersonStatus(person.getStatus()),
    createdAt: person.getCreatedAt(),
    updatedAt: person.getUpdatedAt(),
  };
}

export function toDomain(record: PersonRecord): Person {
  return Person.reconstitute({
    id: PersonId.create(record.id),
    fullName: FullName.create(record.fullName),
    preferredName: record.preferredName
      ? PreferredName.create(record.preferredName)
      : null,
    email: Email.create(record.email),
    document: Document.create(
      toDomainDocumentType(record.documentType),
      record.document,
    ),
    birthDate: BirthDate.create(toLocalDate(record.birthDate)),
    phone: Phone.createOptional(record.phone),
    status: toDomainPersonStatus(record.status),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaDocumentType(type: DocumentType): PrismaDocumentType {
  return type as PrismaDocumentType;
}

function toDomainDocumentType(type: PrismaDocumentType): DocumentType {
  return type as DocumentType;
}

function toPrismaPersonStatus(status: PersonStatus): PrismaPersonStatus {
  return status as PrismaPersonStatus;
}

function toDomainPersonStatus(status: PrismaPersonStatus): PersonStatus {
  return status as PersonStatus;
}

function toLocalDate(value: Date): Date {
  return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

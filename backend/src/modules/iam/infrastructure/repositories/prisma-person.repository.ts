import type { PrismaClient } from '@prisma/client';
import { DocumentType as PrismaDocumentType } from '@prisma/client';
import type { PersonRepository } from '../../domain/repositories/person-repository.js';
import type { Document } from '../../domain/value-objects/document.js';
import type { Email } from '../../domain/value-objects/email.js';
import type { PersonId } from '../../domain/value-objects/person-id.js';
import type { Person } from '../../domain/aggregates/person.aggregate.js';
import { toDomain, toPersistence } from '../prisma/prisma-person.mapper.js';

export class PrismaPersonRepository implements PersonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(person: Person): Promise<void> {
    const data = toPersistence(person);

    await this.prisma.person.upsert({
      where: { id: data.id },
      create: data,
      update: {
        fullName: data.fullName,
        preferredName: data.preferredName,
        email: data.email,
        phone: data.phone,
        document: data.document,
        documentType: data.documentType,
        birthDate: data.birthDate,
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: PersonId): Promise<Person | null> {
    const record = await this.prisma.person.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<Person | null> {
    const record = await this.prisma.person.findUnique({
      where: { email: email.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByDocument(document: Document): Promise<Person | null> {
    const record = await this.prisma.person.findUnique({
      where: {
        documentType_document: {
          documentType: document.getType() as PrismaDocumentType,
          document: document.getValue(),
        },
      },
    });

    return record ? toDomain(record) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }

  async existsByDocument(document: Document): Promise<boolean> {
    return (await this.findByDocument(document)) !== null;
  }
}

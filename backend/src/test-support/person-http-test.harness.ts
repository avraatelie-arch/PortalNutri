import type { FastifyInstance, InjectOptions } from 'fastify';
import { buildApp } from '../app.js';
import { configureIntegrationTestEnv } from '../config/test-env.js';

export { requireDatabaseUrl } from '../config/test-env.js';
import { getPrismaClient } from '../core/database/prisma-client.js';
import { Person } from '../modules/iam/domain/aggregates/person.aggregate.js';
import { DocumentType } from '../modules/iam/domain/value-objects/document.js';
import { BirthDate } from '../modules/iam/domain/value-objects/birth-date.js';
import { Document } from '../modules/iam/domain/value-objects/document.js';
import { Email } from '../modules/iam/domain/value-objects/email.js';
import { FullName } from '../modules/iam/domain/value-objects/full-name.js';
import { PersonId } from '../modules/iam/domain/value-objects/person-id.js';
import { Phone } from '../modules/iam/domain/value-objects/phone.js';
import { PreferredName } from '../modules/iam/domain/value-objects/preferred-name.js';
import { PrismaPersonRepository } from '../modules/iam/infrastructure/repositories/prisma-person.repository.js';

export interface SeedPersonFixtureInput {
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentValue: string;
  birthDate: string;
  phone?: string | null;
  preferredName?: string | null;
}

export interface SeededPerson {
  personId: string;
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentValue: string;
  birthDate: string;
  phone: string | null;
}

let fixtureCounter = 0;

export async function createPersonHttpTestApp(): Promise<FastifyInstance> {
  configureIntegrationTestEnv();
  return buildApp();
}

export async function resetPersons(): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
}

export function nextFixtureSuffix(): string {
  fixtureCounter += 1;
  return `${fixtureCounter}`;
}

export function validCreatePersonPayload(suffix = nextFixtureSuffix()) {
  return {
    fullName: 'Maria Silva',
    email: `maria.${suffix}@example.com`,
    documentType: DocumentType.PASSPORT,
    document: `AB${suffix}`,
    birthDate: '1990-06-15',
    phone: '+5511999999999',
  };
}

function parseBirthDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function createRepository(): PrismaPersonRepository {
  return new PrismaPersonRepository(getPrismaClient());
}

export async function seedPersonFixture(
  overrides: Partial<SeedPersonFixtureInput> = {},
): Promise<SeededPerson> {
  const suffix = nextFixtureSuffix();
  const input: SeedPersonFixtureInput = {
    fullName: 'Fixture Person',
    email: `fixture.${suffix}@example.com`,
    documentType: DocumentType.PASSPORT,
    documentValue: `FX${suffix}`,
    birthDate: '1990-06-15',
    phone: '+5511999999999',
    preferredName: null,
    ...overrides,
  };

  const person = Person.create({
    fullName: FullName.create(input.fullName),
    preferredName: PreferredName.createOptional(input.preferredName),
    email: Email.create(input.email),
    document: Document.create(input.documentType, input.documentValue),
    birthDate: BirthDate.create(parseBirthDate(input.birthDate)),
    phone: Phone.createOptional(input.phone),
  });

  person.pullDomainEvents();

  const repository = createRepository();
  await repository.save(person);

  return {
    personId: person.getId().toString(),
    fullName: input.fullName,
    email: input.email,
    documentType: input.documentType,
    documentValue: input.documentValue,
    birthDate: input.birthDate,
    phone: input.phone ?? null,
  };
}

export async function seedInactivePersonFixture(
  overrides: Partial<SeedPersonFixtureInput> = {},
): Promise<SeededPerson> {
  const seeded = await seedPersonFixture(overrides);
  const repository = createRepository();
  const person = await repository.findById(PersonId.create(seeded.personId));

  if (!person) {
    throw new Error('Failed to load seeded person for deactivation fixture.');
  }

  person.deactivate();
  person.pullDomainEvents();
  await repository.save(person);

  return seeded;
}

export async function injectJson(
  app: FastifyInstance,
  options: InjectOptions,
): Promise<{ statusCode: number; body: unknown }> {
  const response = await app.inject(options);

  let body: unknown = response.body;

  if (response.headers['content-type']?.includes('application/json')) {
    body = response.json();
  }

  return {
    statusCode: response.statusCode,
    body,
  };
}

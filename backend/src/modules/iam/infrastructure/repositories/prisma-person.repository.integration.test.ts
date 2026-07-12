import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { CreatePersonCommand } from '../../application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../application/create-person/create-person.handler.js';
import { DeactivatePersonCommand } from '../../application/deactivate-person/deactivate-person.command.js';
import { DeactivatePersonHandler } from '../../application/deactivate-person/deactivate-person.handler.js';
import { UpdatePersonCommand } from '../../application/update-person/update-person.command.js';
import { UpdatePersonHandler } from '../../application/update-person/update-person.handler.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { Document } from '../../domain/value-objects/document.js';
import { Email } from '../../domain/value-objects/email.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { PrismaPersonRepository } from './prisma-person.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const repository = new PrismaPersonRepository(prisma);

async function resetPersons() {
  await prisma.person.deleteMany();
}

describe('PrismaPersonRepository (integration)', () => {
  before(async () => {
    await resetPersons();
  });

  after(async () => {
    await resetPersons();
    await prisma.$disconnect();
  });

  it('persists and finds a person by id', async () => {
    const createHandler = new CreatePersonHandler(repository);

    const created = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'AB123456',
        birthDate: '1990-06-15',
        phone: '+5511999999999',
      }),
    );

    const found = await repository.findById(PersonId.create(created.id));

    assert.ok(found);
    assert.equal(found.getFullName().toString(), 'Maria Silva');
    assert.equal(found.getEmail().toString(), 'maria.silva@example.com');
    assert.equal(found.getDocument().getValue(), 'AB123456');
    assert.equal(found.getBirthDate().toString(), '1990-06-15');
    assert.equal(found.getPhone()?.toString(), '+5511999999999');
    assert.equal(found.getStatus(), PersonStatus.Active);
  });

  it('finds a person by email', async () => {
    const createHandler = new CreatePersonHandler(repository);

    const created = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'João Santos',
        email: 'joao.santos@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'CD987654',
        birthDate: '1985-03-20',
      }),
    );

    const found = await repository.findByEmail(
      Email.create('joao.santos@example.com'),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), created.id);
  });

  it('finds a person by document', async () => {
    const createHandler = new CreatePersonHandler(repository);

    const created = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'Ana Costa',
        email: 'ana.costa@example.com',
        documentType: DocumentType.RG,
        document: 'MG1234567',
        birthDate: '1992-11-03',
      }),
    );

    const found = await repository.findByDocument(
      Document.create(DocumentType.RG, 'MG1234567'),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), created.id);
  });

  it('reports existence by email and document', async () => {
    const createHandler = new CreatePersonHandler(repository);

    await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'Carla Dias',
        email: 'carla.dias@example.com',
        documentType: DocumentType.CNH,
        document: 'CNH998877',
        birthDate: '1988-01-10',
      }),
    );

    assert.equal(
      await repository.existsByEmail(Email.create('carla.dias@example.com')),
      true,
    );
    assert.equal(
      await repository.existsByEmail(Email.create('missing@example.com')),
      false,
    );
    assert.equal(
      await repository.existsByDocument(
        Document.create(DocumentType.CNH, 'CNH998877'),
      ),
      true,
    );
    assert.equal(
      await repository.existsByDocument(
        Document.create(DocumentType.CNH, 'CNH000000'),
      ),
      false,
    );
  });

  it('persists updates', async () => {
    const createHandler = new CreatePersonHandler(repository);
    const updateHandler = new UpdatePersonHandler(repository);

    const created = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'Pedro Lima',
        preferredName: 'Pedro',
        email: 'pedro.lima@example.com',
        documentType: DocumentType.OTHER,
        document: 'DOC12345',
        birthDate: '1995-07-22',
        phone: '+5511777777777',
      }),
    );

    await updateHandler.execute(
      new UpdatePersonCommand({
        personId: created.id,
        fullName: 'Pedro Lima Souza',
        preferredName: null,
        email: 'pedro.souza@example.com',
        phone: '+5511666666666',
      }),
    );

    const found = await repository.findById(PersonId.create(created.id));

    assert.ok(found);
    assert.equal(found.getFullName().toString(), 'Pedro Lima Souza');
    assert.equal(found.getPreferredName(), null);
    assert.equal(found.getEmail().toString(), 'pedro.souza@example.com');
    assert.equal(found.getPhone()?.toString(), '+5511666666666');
    assert.equal(found.getDocument().getValue(), 'DOC12345');
    assert.equal(found.getBirthDate().toString(), '1995-07-22');
  });

  it('persists deactivation status', async () => {
    const createHandler = new CreatePersonHandler(repository);
    const deactivateHandler = new DeactivatePersonHandler(repository);

    const created = await createHandler.execute(
      new CreatePersonCommand({
        fullName: 'Lucia Ferreira',
        email: 'lucia.ferreira@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'EF445566',
        birthDate: '1979-12-01',
      }),
    );

    await deactivateHandler.execute(
      new DeactivatePersonCommand(created.id),
    );

    const found = await repository.findById(PersonId.create(created.id));

    assert.ok(found);
    assert.equal(found.getStatus(), PersonStatus.Inactive);
    assert.equal(found.isActive(), false);
  });

  it('returns null when person does not exist', async () => {
    const found = await repository.findById(
      PersonId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});

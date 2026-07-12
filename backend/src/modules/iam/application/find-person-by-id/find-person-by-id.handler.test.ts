import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { FindPersonByIdHandler } from './find-person-by-id.handler.js';
import { FindPersonByIdQuery } from './find-person-by-id.query.js';

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedPerson(
  overrides: Partial<CreatePersonCommand['request']> = {},
  repository = new InMemoryPersonRepository(),
) {
  const createHandler = new CreatePersonHandler(repository);

  const created = await createHandler.execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.silva@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AB123456',
      birthDate: '1990-06-15',
      phone: '+5511999999999',
      ...overrides,
    }),
  );

  return { repository, created };
}

describe('FindPersonByIdHandler', () => {
  it('finds an existing person by id', async () => {
    const { repository, created } = await seedPerson();
    const handler = new FindPersonByIdHandler(repository);

    const result = await handler.execute(
      new FindPersonByIdQuery(created.id),
    );

    assert.equal(result.id, created.id);
  });

  it('returns all expected data in the result', async () => {
    const { repository, created } = await seedPerson({
      preferredName: 'Mari',
    });
    const handler = new FindPersonByIdHandler(repository);

    const result = await handler.execute(
      new FindPersonByIdQuery(created.id),
    );

    assert.equal(result.id, created.id);
    assert.equal(result.fullName, 'Maria Silva');
    assert.equal(result.preferredName, 'Mari');
    assert.equal(result.email, 'maria.silva@example.com');
    assert.equal(result.phone, '+5511999999999');
    assert.equal(result.document, 'AB123456');
    assert.equal(result.documentType, DocumentType.PASSPORT);
    assert.equal(result.birthDate, '1990-06-15');
    assert.equal(result.status, PersonStatus.Active);
    assert.ok(result.createdAt);
    assert.ok(result.updatedAt);
  });

  it('returns null preferred name when not informed', async () => {
    const { repository, created } = await seedPerson();
    const handler = new FindPersonByIdHandler(repository);

    const result = await handler.execute(
      new FindPersonByIdQuery(created.id),
    );

    assert.equal(result.preferredName, null);
  });

  it('throws PersonNotFoundError when id does not exist', async () => {
    const handler = new FindPersonByIdHandler(new InMemoryPersonRepository());

    await assert.rejects(
      () => handler.execute(new FindPersonByIdQuery(UNKNOWN_PERSON_ID)),
      (error: unknown) => {
        assert.ok(error instanceof PersonNotFoundError);
        assert.equal(error.code, 'PERSON_NOT_FOUND');
        assert.equal(error.personId, UNKNOWN_PERSON_ID);
        return true;
      },
    );
  });

  it('does not mutate the aggregate', async () => {
    const { repository, created } = await seedPerson();
    const handler = new FindPersonByIdHandler(repository);
    const personBefore = await repository.findById(
      PersonId.create(created.id),
    );

    assert.ok(personBefore);

    await handler.execute(new FindPersonByIdQuery(created.id));

    const personAfter = await repository.findById(personBefore.getId());

    assert.ok(personAfter);
    assert.equal(
      personAfter.getFullName().toString(),
      personBefore.getFullName().toString(),
    );
    assert.equal(
      personAfter.getEmail().toString(),
      personBefore.getEmail().toString(),
    );
    assert.equal(
      personAfter.getDocument().getValue(),
      personBefore.getDocument().getValue(),
    );
    assert.equal(personAfter.getStatus(), personBefore.getStatus());
    assert.equal(
      personAfter.getUpdatedAt().toISOString(),
      personBefore.getUpdatedAt().toISOString(),
    );
  });

  it('does not publish domain events', async () => {
    const { repository, created } = await seedPerson();
    const handler = new FindPersonByIdHandler(repository);
    const person = await repository.findById(PersonId.create(created.id));

    assert.ok(person);
    assert.equal(person.domainEvents.length, 0);

    await handler.execute(new FindPersonByIdQuery(created.id));

    assert.equal(person.domainEvents.length, 0);
  });
});

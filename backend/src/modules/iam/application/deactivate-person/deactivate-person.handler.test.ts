import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { PersonStatus } from '../../domain/value-objects/person-status.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { DeactivatePersonCommand } from './deactivate-person.command.js';
import { DeactivatePersonHandler } from './deactivate-person.handler.js';

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

describe('DeactivatePersonHandler', () => {
  it('deactivates an active person', async () => {
    const { repository, created } = await seedPerson();
    const handler = new DeactivatePersonHandler(repository);

    const result = await handler.execute(
      new DeactivatePersonCommand(created.id),
    );

    assert.equal(result.id, created.id);
    assert.equal(result.status, PersonStatus.Inactive);
  });

  it('persists deactivated person in repository', async () => {
    const { repository, created } = await seedPerson();
    const handler = new DeactivatePersonHandler(repository);

    await handler.execute(new DeactivatePersonCommand(created.id));

    const saved = await repository.findById(PersonId.create(created.id));

    assert.ok(saved);
    assert.equal(saved.getStatus(), PersonStatus.Inactive);
    assert.equal(saved.isActive(), false);
  });

  it('does not remove the person from repository', async () => {
    const { repository, created } = await seedPerson();
    const handler = new DeactivatePersonHandler(repository);

    await handler.execute(new DeactivatePersonCommand(created.id));

    const saved = await repository.findById(PersonId.create(created.id));

    assert.ok(saved);
    assert.equal(saved.getId().toString(), created.id);
  });

  it('does not change other attributes', async () => {
    const { repository, created } = await seedPerson({
      preferredName: 'Mari',
    });
    const handler = new DeactivatePersonHandler(repository);
    const before = await repository.findById(PersonId.create(created.id));

    assert.ok(before);

    const result = await handler.execute(
      new DeactivatePersonCommand(created.id),
    );

    assert.equal(result.fullName, 'Maria Silva');
    assert.equal(result.preferredName, 'Mari');
    assert.equal(result.email, 'maria.silva@example.com');
    assert.equal(result.phone, '+5511999999999');
    assert.equal(result.document, 'AB123456');
    assert.equal(result.documentType, DocumentType.PASSPORT);
    assert.equal(result.birthDate, '1990-06-15');
    assert.equal(
      result.fullName,
      before.getFullName().toString(),
    );
    assert.equal(
      result.email,
      before.getEmail().toString(),
    );
  });

  it('is idempotent when person is already inactive', async () => {
    const { repository, created } = await seedPerson();
    const handler = new DeactivatePersonHandler(repository);

    await handler.execute(new DeactivatePersonCommand(created.id));

    const result = await handler.execute(
      new DeactivatePersonCommand(created.id),
    );

    assert.equal(result.status, PersonStatus.Inactive);
  });

  it('throws PersonNotFoundError when person does not exist', async () => {
    const handler = new DeactivatePersonHandler(new InMemoryPersonRepository());

    await assert.rejects(
      () => handler.execute(new DeactivatePersonCommand(UNKNOWN_PERSON_ID)),
      (error: unknown) => {
        assert.ok(error instanceof PersonNotFoundError);
        assert.equal(error.code, 'PERSON_NOT_FOUND');
        assert.equal(error.personId, UNKNOWN_PERSON_ID);
        return true;
      },
    );
  });
});

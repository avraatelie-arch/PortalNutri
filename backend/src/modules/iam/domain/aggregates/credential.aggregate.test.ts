import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../errors/domain-error.js';
import { Credential } from './credential.aggregate.js';
import { CredentialId } from '../value-objects/credential-id.js';
import { CredentialStatus } from '../value-objects/credential-status.js';
import { PasswordHash } from '../value-objects/password-hash.js';
import { PersonId } from '../value-objects/person-id.js';

const PERSON_ID = '550e8400-e29b-41d4-a716-446655440000';
const HASH_A = '$argon2id$v=19$m=65536,t=3,p=4$c2FsdA$hashA';
const HASH_B = '$argon2id$v=19$m=65536,t=3,p=4$c2FsdA$hashB';

function createCredential(
  overrides: Partial<{
    passwordHash: PasswordHash;
    status: CredentialStatus;
  }> = {},
) {
  return Credential.create({
    personId: PersonId.create(PERSON_ID),
    passwordHash: overrides.passwordHash ?? PasswordHash.fromHash(HASH_A),
  });
}

describe('Credential aggregate', () => {
  it('creates an active credential', () => {
    const credential = createCredential();

    assert.equal(credential.getStatus(), CredentialStatus.Active);
    assert.equal(credential.getPersonId().toString(), PERSON_ID);
    assert.equal(credential.getPasswordHash().toString(), HASH_A);
    assert.equal(credential.domainEvents.length, 0);
  });

  it('changes password and emits PasswordChanged', () => {
    const credential = createCredential();

    credential.changePassword(PasswordHash.fromHash(HASH_B));

    assert.equal(credential.getPasswordHash().toString(), HASH_B);
    assert.equal(credential.domainEvents.length, 1);
    assert.equal(credential.domainEvents[0]?.eventName, 'PasswordChanged');
  });

  it('does not emit PasswordChanged when password is unchanged', () => {
    const credential = createCredential();

    credential.changePassword(PasswordHash.fromHash(HASH_A));

    assert.equal(credential.domainEvents.length, 0);
  });

  it('locks an active credential', () => {
    const credential = createCredential();

    credential.lock();

    assert.equal(credential.getStatus(), CredentialStatus.Locked);
  });

  it('unlocks a locked credential', () => {
    const credential = createCredential();

    credential.lock();
    credential.unlock();

    assert.equal(credential.getStatus(), CredentialStatus.Active);
  });

  it('disables an active credential', () => {
    const credential = createCredential();

    credential.disable();

    assert.equal(credential.getStatus(), CredentialStatus.Disabled);
  });

  it('rejects password change when credential is locked', () => {
    const credential = createCredential();

    credential.lock();

    assert.throws(
      () => credential.changePassword(PasswordHash.fromHash(HASH_B)),
      DomainError,
    );
  });

  it('rejects locking a disabled credential', () => {
    const credential = createCredential();

    credential.disable();

    assert.throws(() => credential.lock(), DomainError);
  });

  it('reconstitutes persisted state', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-06-01T00:00:00.000Z');

    const credential = Credential.reconstitute({
      id: CredentialId.create('660e8400-e29b-41d4-a716-446655440001'),
      personId: PersonId.create(PERSON_ID),
      passwordHash: PasswordHash.fromHash(HASH_A),
      status: CredentialStatus.Locked,
      createdAt,
      updatedAt,
    });

    assert.equal(credential.getStatus(), CredentialStatus.Locked);
    assert.equal(credential.getCreatedAt(), createdAt);
    assert.equal(credential.getUpdatedAt(), updatedAt);
  });
});

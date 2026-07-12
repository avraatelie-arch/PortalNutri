import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Argon2PasswordHasher } from './argon2-password-hasher.js';

const hasher = new Argon2PasswordHasher({
  timeCost: 2,
  memoryCost: 65536,
  parallelism: 1,
});

describe('Argon2PasswordHasher', () => {
  it('hashes and verifies a password with Argon2id', async () => {
    const hash = await hasher.hash('SecureP@ssw0rd');

    assert.match(hash, /^\$argon2id\$/);
    assert.equal(await hasher.verify(hash, 'SecureP@ssw0rd'), true);
    assert.equal(await hasher.verify(hash, 'wrong-password'), false);
  });
});

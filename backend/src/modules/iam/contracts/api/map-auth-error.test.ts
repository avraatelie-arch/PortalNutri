import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CredentialAlreadyExistsError } from '../../application/errors/credential-already-exists.error.js';
import { PersonInactiveError } from '../../application/errors/person-inactive.error.js';
import { PersonNotFoundError } from '../../application/errors/person-not-found.error.js';
import { mapAuthErrorToHttp } from './map-auth-error.js';

describe('mapAuthErrorToHttp', () => {
  it('maps CredentialAlreadyExistsError to 409', () => {
    const mapped = mapAuthErrorToHttp(
      new CredentialAlreadyExistsError('550e8400-e29b-41d4-a716-446655440000'),
    );

    assert.equal(mapped.statusCode, 409);
    assert.equal(mapped.error, 'Conflict');
  });

  it('maps PersonInactiveError to 403', () => {
    const mapped = mapAuthErrorToHttp(
      new PersonInactiveError('550e8400-e29b-41d4-a716-446655440000'),
    );

    assert.equal(mapped.statusCode, 403);
    assert.equal(mapped.error, 'Forbidden');
  });

  it('maps PersonNotFoundError to 404', () => {
    const mapped = mapAuthErrorToHttp(
      new PersonNotFoundError('550e8400-e29b-41d4-a716-446655440000'),
    );

    assert.equal(mapped.statusCode, 404);
    assert.equal(mapped.error, 'Not Found');
  });
});

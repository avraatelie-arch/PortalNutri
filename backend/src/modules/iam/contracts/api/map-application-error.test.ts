import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PersonDocumentAlreadyExistsError } from '../../application/errors/person-document-already-exists.error.js';
import { PersonEmailAlreadyExistsError } from '../../application/errors/person-email-already-exists.error.js';
import { PersonNotFoundError } from '../../application/errors/person-not-found.error.js';
import { PersonValidationError } from '../../application/errors/person-validation.error.js';
import {
  GENERIC_INTERNAL_ERROR_MESSAGE,
  mapApplicationErrorToHttp,
} from './map-application-error.js';

describe('mapApplicationErrorToHttp', () => {
  it('maps PersonNotFoundError to 404', () => {
    const mapped = mapApplicationErrorToHttp(
      new PersonNotFoundError('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(mapped.statusCode, 404);
    assert.equal(mapped.error, 'Not Found');
  });

  it('maps PersonEmailAlreadyExistsError to 409', () => {
    const mapped = mapApplicationErrorToHttp(
      new PersonEmailAlreadyExistsError('maria@example.com'),
    );

    assert.equal(mapped.statusCode, 409);
    assert.equal(mapped.error, 'Conflict');
  });

  it('maps PersonDocumentAlreadyExistsError to 409', () => {
    const mapped = mapApplicationErrorToHttp(
      new PersonDocumentAlreadyExistsError('CPF', '12345678901'),
    );

    assert.equal(mapped.statusCode, 409);
    assert.equal(mapped.error, 'Conflict');
  });

  it('maps PersonValidationError to 400', () => {
    const mapped = mapApplicationErrorToHttp(
      new PersonValidationError('BirthDate must use YYYY-MM-DD format.'),
    );

    assert.equal(mapped.statusCode, 400);
    assert.equal(mapped.error, 'Bad Request');
    assert.equal(mapped.message, 'BirthDate must use YYYY-MM-DD format.');
  });

  it('maps unknown errors to a generic 500 response', () => {
    const mapped = mapApplicationErrorToHttp(new Error('database connection lost'));

    assert.equal(mapped.statusCode, 500);
    assert.equal(mapped.error, 'Internal Server Error');
    assert.equal(mapped.message, GENERIC_INTERNAL_ERROR_MESSAGE);
  });
});

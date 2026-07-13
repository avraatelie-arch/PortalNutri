import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractBearerToken } from './extract-bearer-token.js';

describe('extractBearerToken', () => {
  it('extracts a bearer token from the authorization header', () => {
    assert.equal(
      extractBearerToken('Bearer eyJhbGciOiJIUzI1NiJ9.token'),
      'eyJhbGciOiJIUzI1NiJ9.token',
    );
  });

  it('accepts a case-insensitive bearer scheme', () => {
    assert.equal(
      extractBearerToken('bearer eyJhbGciOiJIUzI1NiJ9.token'),
      'eyJhbGciOiJIUzI1NiJ9.token',
    );
  });

  it('returns null for missing or invalid headers', () => {
    assert.equal(extractBearerToken(undefined), null);
    assert.equal(extractBearerToken('Token abc'), null);
    assert.equal(extractBearerToken('Bearer'), null);
  });
});

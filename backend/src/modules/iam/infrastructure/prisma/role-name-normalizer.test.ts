import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeRoleNameForPersistence } from './role-name-normalizer.js';

describe('normalizeRoleNameForPersistence', () => {
  it('applies trim, collapse, lowercase and NFKC', () => {
    assert.equal(
      normalizeRoleNameForPersistence('  Clinic   Admin  '),
      'clinic admin',
    );
  });

  it('treats case variants as the same normalized value', () => {
    assert.equal(
      normalizeRoleNameForPersistence('CLINIC ADMIN'),
      normalizeRoleNameForPersistence('clinic admin'),
    );
  });
});

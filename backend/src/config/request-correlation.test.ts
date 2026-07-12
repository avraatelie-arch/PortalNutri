import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveRequestId } from './request-correlation.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('resolveRequestId', () => {
  it('returns the incoming request id when it is within the allowed length', () => {
    const requestId = 'client-correlation-123';

    assert.equal(resolveRequestId(requestId), requestId);
  });

  it('generates a UUID when the incoming request id is empty', () => {
    assert.match(resolveRequestId(''), UUID_PATTERN);
  });

  it('generates a UUID when the incoming request id is longer than 128 characters', () => {
    const requestId = 'a'.repeat(129);

    assert.match(resolveRequestId(requestId), UUID_PATTERN);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPublicRoute } from './public-routes.js';

describe('isPublicRoute', () => {
  it('allows OPTIONS requests', () => {
    assert.equal(isPublicRoute('OPTIONS', '/api/iam/persons', false), true);
  });

  it('allows health and documentation routes', () => {
    assert.equal(isPublicRoute('GET', '/health', false), true);
    assert.equal(isPublicRoute('GET', '/health/live', false), true);
    assert.equal(isPublicRoute('GET', '/health/ready', false), true);
    assert.equal(isPublicRoute('GET', '/api/health', false), true);
    assert.equal(isPublicRoute('GET', '/docs', false), true);
    assert.equal(isPublicRoute('GET', '/docs/json', false), true);
  });

  it('allows login and refresh routes', () => {
    assert.equal(isPublicRoute('POST', '/api/auth/login', false), true);
    assert.equal(isPublicRoute('POST', '/api/auth/refresh', false), true);
  });

  it('allows credential registration only when enabled', () => {
    assert.equal(
      isPublicRoute('POST', '/api/auth/credentials', true),
      true,
    );
    assert.equal(
      isPublicRoute('POST', '/api/auth/credentials', false),
      false,
    );
  });

  it('requires authentication for protected routes', () => {
    assert.equal(isPublicRoute('GET', '/api/auth/me', true), false);
    assert.equal(isPublicRoute('GET', '/api/iam/persons/1', true), false);
  });
});

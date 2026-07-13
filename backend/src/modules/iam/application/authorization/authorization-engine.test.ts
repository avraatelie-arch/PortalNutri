import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from './authorization-action.js';
import { AuthorizationEngine } from './authorization-engine.js';
import type { AuthorizationContext } from './authorization-context.js';
import { AuthorizationOutcome } from './authorization-decision.js';
import type { AuthorizationPolicy } from './authorization-policy.js';
import { AuthorizationResource } from './authorization-resource.js';

function createContext(
  overrides: Partial<AuthorizationContext> = {},
): AuthorizationContext {
  return {
    personId: 'person-a',
    sessionId: 'session-a',
    tenantId: null,
    resource: AuthorizationResource.PERSON,
    action: AuthorizationAction.READ,
    resourceId: 'person-a',
    ...overrides,
  };
}

function createPolicy(
  outcome: AuthorizationOutcome,
): AuthorizationPolicy {
  return {
    evaluate: () => outcome,
  };
}

describe('AuthorizationEngine', () => {
  it('returns DENY when any policy explicitly denies', () => {
    const engine = new AuthorizationEngine([
      createPolicy(AuthorizationOutcome.ALLOW),
      createPolicy(AuthorizationOutcome.DENY),
      createPolicy(AuthorizationOutcome.ALLOW),
    ]);

    assert.equal(
      engine.authorize(createContext()),
      AuthorizationOutcome.DENY,
    );
  });

  it('returns ALLOW when at least one policy allows and none denies', () => {
    const engine = new AuthorizationEngine([
      createPolicy(AuthorizationOutcome.ABSTAIN),
      createPolicy(AuthorizationOutcome.ALLOW),
    ]);

    assert.equal(
      engine.authorize(createContext()),
      AuthorizationOutcome.ALLOW,
    );
  });

  it('returns DENY when all policies abstain', () => {
    const engine = new AuthorizationEngine([
      createPolicy(AuthorizationOutcome.ABSTAIN),
      createPolicy(AuthorizationOutcome.ABSTAIN),
    ]);

    assert.equal(
      engine.authorize(createContext()),
      AuthorizationOutcome.DENY,
    );
  });

  it('returns DENY when no policies are registered', () => {
    const engine = new AuthorizationEngine([]);

    assert.equal(
      engine.authorize(createContext()),
      AuthorizationOutcome.DENY,
    );
  });
});

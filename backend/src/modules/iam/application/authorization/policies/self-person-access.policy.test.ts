import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationContext } from '../authorization-context.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import { AuthorizationResource } from '../authorization-resource.js';
import { SelfPersonAccessPolicy } from './self-person-access.policy.js';

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

describe('SelfPersonAccessPolicy', () => {
  const policy = new SelfPersonAccessPolicy();

  it('allows self READ access', () => {
    assert.equal(
      policy.evaluate(createContext({ action: AuthorizationAction.READ })),
      AuthorizationOutcome.ALLOW,
    );
  });

  it('allows self UPDATE access', () => {
    assert.equal(
      policy.evaluate(createContext({ action: AuthorizationAction.UPDATE })),
      AuthorizationOutcome.ALLOW,
    );
  });

  it('allows self DELETE access', () => {
    assert.equal(
      policy.evaluate(createContext({ action: AuthorizationAction.DELETE })),
      AuthorizationOutcome.ALLOW,
    );
  });

  it('denies access to another person', () => {
    assert.equal(
      policy.evaluate(createContext({ resourceId: 'person-b' })),
      AuthorizationOutcome.DENY,
    );
  });

  it('denies CREATE for authenticated users', () => {
    assert.equal(
      policy.evaluate(
        createContext({
          action: AuthorizationAction.CREATE,
          resourceId: null,
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('abstains for non-person resources', () => {
    assert.equal(
      policy.evaluate(
        createContext({
          resource: 'OTHER' as AuthorizationResource,
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('abstains for EXECUTE action', () => {
    assert.equal(
      policy.evaluate(
        createContext({
          action: AuthorizationAction.EXECUTE,
          resourceId: null,
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });
});

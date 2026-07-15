import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationContext } from '../authorization-context.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import { AuthorizationResource } from '../authorization-resource.js';
import { TenantResourceScopePolicy } from './tenant-resource-scope.policy.js';

function createInput(
  overrides: Partial<AuthorizationContext> = {},
): AuthorizationEvaluationInput {
  return {
    context: {
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: 'tenant-a',
      resource: AuthorizationResource.TENANT,
      action: AuthorizationAction.READ,
      resourceId: 'tenant-a',
      ...overrides,
    },
    permissionGranted: true,
  };
}

describe('TenantResourceScopePolicy', () => {
  const policy = new TenantResourceScopePolicy();

  it('abstains for non-tenant resources', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          resource: AuthorizationResource.PERSON,
          resourceId: 'person-a',
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('abstains for tenant creation without a resource id', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          action: AuthorizationAction.CREATE,
          resourceId: null,
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('abstains when tenant resource id matches the bound tenant', () => {
    assert.equal(
      policy.evaluate(createInput()),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('denies when tenant resource id differs from the bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          resourceId: 'tenant-b',
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('denies when session tenant is not bound', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          tenantId: null,
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('denies activate and deactivate on other tenant ids', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          action: AuthorizationAction.UPDATE,
          resourceId: 'tenant-b',
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });
});

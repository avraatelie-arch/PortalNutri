import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from '../authorization-action.js';
import { createEmptyAuthorizationContext } from '../authorization-context.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import { AuthorizationResource } from '../authorization-resource.js';
import { MembershipResourceScopePolicy } from './membership-resource-scope.policy.js';

function createInput(
  overrides: {
    tenantId?: string | null;
    resolvedTenantIds?: string[];
    resolvedScopeRefCount?: number;
    action?: AuthorizationAction;
  } = {},
): AuthorizationEvaluationInput {
  return {
    context: createEmptyAuthorizationContext({
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: 'tenant-a',
      resource: AuthorizationResource.MEMBERSHIP,
      action: AuthorizationAction.READ,
      resourceId: 'membership-a',
      resolvedTenantIds: new Set(overrides.resolvedTenantIds ?? ['tenant-a']),
      resolvedScopeRefCount: overrides.resolvedScopeRefCount ?? 1,
      ...overrides,
    }),
    permissionGranted: true,
  };
}

describe('MembershipResourceScopePolicy', () => {
  const policy = new MembershipResourceScopePolicy();

  it('abstains for non-membership resources', () => {
    const input = createInput({ resolvedTenantIds: ['tenant-a'] });
    input.context = {
      ...input.context,
      resource: AuthorizationResource.PERSON,
    };

    assert.equal(
      policy.evaluate(input),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('denies when session tenant is not bound', () => {
    assert.equal(
      policy.evaluate(createInput({ tenantId: null })),
      AuthorizationOutcome.DENY,
    );
  });

  it('denies POST when body tenant differs from bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          action: AuthorizationAction.CREATE,
          resolvedTenantIds: ['tenant-b'],
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('abstains POST when body tenant matches bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          action: AuthorizationAction.CREATE,
          resolvedTenantIds: ['tenant-a'],
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('denies GET when resolved tenant is missing', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          resolvedTenantIds: [],
          resolvedScopeRefCount: 0,
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('denies GET when resolved tenant differs from bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          resolvedTenantIds: ['tenant-b'],
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('abstains GET when resolved tenant matches bound tenant', () => {
    assert.equal(
      policy.evaluate(createInput()),
      AuthorizationOutcome.ABSTAIN,
    );
  });
});

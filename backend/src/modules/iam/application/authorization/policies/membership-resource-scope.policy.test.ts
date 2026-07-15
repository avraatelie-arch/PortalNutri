import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationContext } from '../authorization-context.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import { AuthorizationResource } from '../authorization-resource.js';
import { MembershipResourceScopePolicy } from './membership-resource-scope.policy.js';

function createInput(
  overrides: Partial<AuthorizationContext> = {},
): AuthorizationEvaluationInput {
  return {
    context: {
      personId: 'person-a',
      sessionId: 'session-a',
      tenantId: 'tenant-a',
      resource: AuthorizationResource.MEMBERSHIP,
      action: AuthorizationAction.READ,
      resourceId: 'membership-a',
      scopeTenantId: null,
      resourceTenantId: 'tenant-a',
      ...overrides,
    },
    permissionGranted: true,
  };
}

describe('MembershipResourceScopePolicy', () => {
  const policy = new MembershipResourceScopePolicy();

  it('abstains for non-membership resources', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          resource: AuthorizationResource.PERSON,
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
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

  it('denies POST when body tenant differs from bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          action: AuthorizationAction.CREATE,
          resourceId: null,
          scopeTenantId: 'tenant-b',
          resourceTenantId: null,
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
          resourceId: null,
          scopeTenantId: 'tenant-a',
          resourceTenantId: null,
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('denies GET when resolved resource tenant is missing', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          resourceTenantId: null,
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('denies GET when resolved resource tenant differs from bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          resourceTenantId: 'tenant-b',
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('abstains GET when resolved resource tenant matches bound tenant', () => {
    assert.equal(
      policy.evaluate(createInput()),
      AuthorizationOutcome.ABSTAIN,
    );
  });

  it('denies DELETE when route tenant differs from bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          action: AuthorizationAction.DELETE,
          resourceId: null,
          scopeTenantId: 'tenant-b',
          resourceTenantId: null,
        }),
      ),
      AuthorizationOutcome.DENY,
    );
  });

  it('abstains DELETE when route tenant matches bound tenant', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          action: AuthorizationAction.DELETE,
          resourceId: null,
          scopeTenantId: 'tenant-a',
          resourceTenantId: null,
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });
});

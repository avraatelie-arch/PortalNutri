import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationContext } from '../authorization-context.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import { AuthorizationResource } from '../authorization-resource.js';
import { RbacPermissionPolicy } from './rbac-permission.policy.js';

function createInput(
  overrides: Partial<AuthorizationEvaluationInput> = {},
): AuthorizationEvaluationInput {
  const context: AuthorizationContext = {
    personId: 'person-a',
    sessionId: 'session-a',
    tenantId: 'tenant-a',
    resource: AuthorizationResource.PERSON,
    action: AuthorizationAction.READ,
    resourceId: 'person-a',
    ...(overrides.context ?? {}),
  };

  return {
    context,
    permissionGranted: overrides.permissionGranted ?? true,
  };
}

describe('RbacPermissionPolicy', () => {
  const policy = new RbacPermissionPolicy();

  it('allows when permission is granted', () => {
    assert.equal(
      policy.evaluate(createInput({ permissionGranted: true })),
      AuthorizationOutcome.ALLOW,
    );
  });

  it('denies when permission is not granted', () => {
    assert.equal(
      policy.evaluate(createInput({ permissionGranted: false })),
      AuthorizationOutcome.DENY,
    );
  });

  it('abstains for EXECUTE actions', () => {
    assert.equal(
      policy.evaluate(
        createInput({
          context: {
            action: AuthorizationAction.EXECUTE,
            resourceId: null,
          },
        }),
      ),
      AuthorizationOutcome.ABSTAIN,
    );
  });
});

import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';
import { resolveAuthorizationPermissionKey } from '../authorization-permission-key.js';

export class RbacPermissionPolicy implements AuthorizationPolicy {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationOutcome {
    const { context, permissionGranted } = input;

    if (context.action === AuthorizationAction.EXECUTE) {
      return AuthorizationOutcome.ABSTAIN;
    }

    const permissionKey = resolveAuthorizationPermissionKey(context);

    if (permissionKey === null) {
      return AuthorizationOutcome.ABSTAIN;
    }

    return permissionGranted
      ? AuthorizationOutcome.ALLOW
      : AuthorizationOutcome.DENY;
  }
}

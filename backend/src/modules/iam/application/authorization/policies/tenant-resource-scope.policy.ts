import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';
import { AuthorizationResource } from '../authorization-resource.js';

export class TenantResourceScopePolicy implements AuthorizationPolicy {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationOutcome {
    const { context } = input;

    if (context.resource !== AuthorizationResource.TENANT) {
      return AuthorizationOutcome.ABSTAIN;
    }

    if (context.action === AuthorizationAction.CREATE) {
      return AuthorizationOutcome.ABSTAIN;
    }

    if (context.resourceId === null) {
      return AuthorizationOutcome.ABSTAIN;
    }

    if (
      context.tenantId === null
      || context.resourceId !== context.tenantId
    ) {
      return AuthorizationOutcome.DENY;
    }

    return AuthorizationOutcome.ABSTAIN;
  }
}

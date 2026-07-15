import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';
import { AuthorizationResource } from '../authorization-resource.js';
import { evaluateResolvedTenantScope } from '../evaluate-resolved-tenant-scope.js';

export class RoleResourceScopePolicy implements AuthorizationPolicy {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationOutcome {
    const { context } = input;

    if (context.resource !== AuthorizationResource.ROLE) {
      return AuthorizationOutcome.ABSTAIN;
    }

    if (
      context.action !== AuthorizationAction.CREATE
      && context.action !== AuthorizationAction.READ
    ) {
      return AuthorizationOutcome.ABSTAIN;
    }

    return evaluateResolvedTenantScope(context, 1);
  }
}

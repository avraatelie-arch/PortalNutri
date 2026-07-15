import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';
import { AuthorizationResource } from '../authorization-resource.js';
import { evaluateResolvedTenantScope } from '../evaluate-resolved-tenant-scope.js';

function minimumResolvedTenants(action: AuthorizationAction): number {
  switch (action) {
    case AuthorizationAction.READ:
      return 1;
    case AuthorizationAction.CREATE:
    case AuthorizationAction.DELETE:
      return 2;
    default:
      return 0;
  }
}

export class PermissionAssignmentResourceScopePolicy implements AuthorizationPolicy {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationOutcome {
    const { context } = input;

    if (context.resource !== AuthorizationResource.PERMISSION_ASSIGNMENT) {
      return AuthorizationOutcome.ABSTAIN;
    }

    return evaluateResolvedTenantScope(
      context,
      minimumResolvedTenants(context.action),
    );
  }
}

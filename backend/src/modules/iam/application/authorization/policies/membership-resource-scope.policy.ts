import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationEvaluationInput } from '../authorization-evaluation-input.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';
import { AuthorizationResource } from '../authorization-resource.js';

export class MembershipResourceScopePolicy implements AuthorizationPolicy {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationOutcome {
    const { context } = input;

    if (context.resource !== AuthorizationResource.MEMBERSHIP) {
      return AuthorizationOutcome.ABSTAIN;
    }

    if (context.tenantId === null) {
      return AuthorizationOutcome.DENY;
    }

    if (context.action === AuthorizationAction.CREATE) {
      if (
        context.scopeTenantId === null
        || context.scopeTenantId !== context.tenantId
      ) {
        return AuthorizationOutcome.DENY;
      }

      return AuthorizationOutcome.ABSTAIN;
    }

    if (context.action === AuthorizationAction.READ) {
      if (
        context.resourceTenantId === null
        || context.resourceTenantId !== context.tenantId
      ) {
        return AuthorizationOutcome.DENY;
      }

      return AuthorizationOutcome.ABSTAIN;
    }

    if (context.action === AuthorizationAction.DELETE) {
      if (
        context.scopeTenantId === null
        || context.scopeTenantId !== context.tenantId
      ) {
        return AuthorizationOutcome.DENY;
      }

      return AuthorizationOutcome.ABSTAIN;
    }

    return AuthorizationOutcome.ABSTAIN;
  }
}

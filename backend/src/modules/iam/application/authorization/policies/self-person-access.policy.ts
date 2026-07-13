import { AuthorizationAction } from '../authorization-action.js';
import type { AuthorizationContext } from '../authorization-context.js';
import { AuthorizationOutcome } from '../authorization-decision.js';
import type { AuthorizationPolicy } from '../authorization-policy.js';
import { AuthorizationResource } from '../authorization-resource.js';

export class SelfPersonAccessPolicy implements AuthorizationPolicy {
  evaluate(context: AuthorizationContext): AuthorizationOutcome {
    if (context.resource !== AuthorizationResource.PERSON) {
      return AuthorizationOutcome.ABSTAIN;
    }

    if (context.action === AuthorizationAction.CREATE) {
      return AuthorizationOutcome.DENY;
    }

    if (
      context.action !== AuthorizationAction.READ
      && context.action !== AuthorizationAction.UPDATE
      && context.action !== AuthorizationAction.DELETE
    ) {
      return AuthorizationOutcome.ABSTAIN;
    }

    if (!context.resourceId) {
      return AuthorizationOutcome.DENY;
    }

    if (context.personId === context.resourceId) {
      return AuthorizationOutcome.ALLOW;
    }

    return AuthorizationOutcome.DENY;
  }
}

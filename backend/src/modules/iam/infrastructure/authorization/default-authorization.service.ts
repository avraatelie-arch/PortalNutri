import { AuthorizationEngine } from '../../application/authorization/authorization-engine.js';
import type { AuthorizationService } from '../../application/authorization/authorization.service.js';
import { AuthenticatedOnlyPolicy } from '../../application/authorization/policies/authenticated-only.policy.js';
import { SelfPersonAccessPolicy } from '../../application/authorization/policies/self-person-access.policy.js';

export class DefaultAuthorizationService implements AuthorizationService {
  private readonly engine: AuthorizationEngine;

  constructor() {
    this.engine = new AuthorizationEngine([
      new SelfPersonAccessPolicy(),
      new AuthenticatedOnlyPolicy(),
    ]);
  }

  authorize(context: Parameters<AuthorizationService['authorize']>[0]) {
    return this.engine.authorize(context);
  }
}

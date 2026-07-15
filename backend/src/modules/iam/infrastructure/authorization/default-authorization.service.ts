import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { resolveAuthorizationPermissionKey } from '../../application/authorization/authorization-permission-key.js';
import { AuthorizationEngine } from '../../application/authorization/authorization-engine.js';
import type { AuthorizationService } from '../../application/authorization/authorization.service.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';
import type { EffectivePermissionResolver } from '../../application/ports/effective-permission-resolver.port.js';

export class DefaultAuthorizationService implements AuthorizationService {
  constructor(
    private readonly effectivePermissionResolver: EffectivePermissionResolver,
    private readonly scopeResolver: AuthorizationScopeResolver,
    private readonly engine: AuthorizationEngine,
  ) {}

  async authorize(context: AuthorizationContext) {
    const enrichedContext = await this.scopeResolver.enrich(context);
    const permissionKey = resolveAuthorizationPermissionKey(enrichedContext);
    let permissionGranted = false;

    if (permissionKey !== null && enrichedContext.tenantId !== null) {
      permissionGranted = await this.effectivePermissionResolver.hasActivePermission({
        personId: enrichedContext.personId,
        tenantId: enrichedContext.tenantId,
        permissionKey,
      });
    }

    return this.engine.authorize({
      context: enrichedContext,
      permissionGranted,
    });
  }
}

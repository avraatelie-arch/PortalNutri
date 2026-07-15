import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { resolveAuthorizationPermissionKey } from '../../application/authorization/authorization-permission-key.js';
import { AuthorizationEngine } from '../../application/authorization/authorization-engine.js';
import type { AuthorizationService } from '../../application/authorization/authorization.service.js';
import type { EffectivePermissionResolver } from '../../application/ports/effective-permission-resolver.port.js';

export class DefaultAuthorizationService implements AuthorizationService {
  constructor(
    private readonly effectivePermissionResolver: EffectivePermissionResolver,
    private readonly engine: AuthorizationEngine,
  ) {}

  async authorize(context: AuthorizationContext) {
    const permissionKey = resolveAuthorizationPermissionKey(context);
    let permissionGranted = false;

    if (permissionKey !== null && context.tenantId !== null) {
      permissionGranted = await this.effectivePermissionResolver.hasActivePermission({
        personId: context.personId,
        tenantId: context.tenantId,
        permissionKey,
      });
    }

    return this.engine.authorize({
      context,
      permissionGranted,
    });
  }
}

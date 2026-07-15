import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';

export class CompositeAuthorizationScopeResolver implements AuthorizationScopeResolver {
  constructor(private readonly resolvers: AuthorizationScopeResolver[]) {}

  async enrich(context: AuthorizationContext): Promise<AuthorizationContext> {
    let enriched = context;

    for (const resolver of this.resolvers) {
      enriched = await resolver.enrich(enriched);
    }

    return enriched;
  }
}

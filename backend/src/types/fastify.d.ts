import type { SecurityContext } from '../modules/iam/application/security-context.js';
import type { AuthorizationContext } from '../modules/iam/application/authorization/authorization-context.js';
import type { RouteAuthorizationMetadata } from '../bootstrap/authorization/route-authorization-metadata.js';

declare module 'fastify' {
  interface FastifyRequest {
    securityContext: SecurityContext | null;
    authorizationContext: AuthorizationContext | null;
  }

  interface FastifyContextConfig {
    authorization?: RouteAuthorizationMetadata;
  }
}

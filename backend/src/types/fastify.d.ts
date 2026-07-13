import type { SecurityContext } from '../modules/iam/application/security-context.js';

declare module 'fastify' {
  interface FastifyRequest {
    securityContext: SecurityContext | null;
  }
}

import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { registerAuthentication } from './auth/register-authentication.js';
import { registerAuthorization } from './authorization/register-authorization.js';
import {
  createIamDependencies,
  registerAuthModule,
  registerIamModule,
  registerTenantModule,
} from '../modules/iam/iam.module.js';
import {
  registerDeprecatedHealthAlias,
  registerHealthRoutes,
} from './routes/health.js';

export async function registerModules(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  const dependencies = createIamDependencies(env);

  registerAuthentication(
    app,
    env,
    dependencies.sessionHandlers.validateAccessTokenHandler,
  );

  registerAuthorization(app, env, dependencies.authorizationService);

  await registerHealthRoutes(app);

  await app.register(
    async (api) => {
      await registerDeprecatedHealthAlias(api);
      await api.register(
        async (iamApi) =>
          registerIamModule(iamApi, dependencies.personHandlers),
        { prefix: '/iam' },
      );
      await api.register(
        async (authApi) =>
          registerAuthModule(authApi, env, {
            ...dependencies.authHandlers,
            ...dependencies.sessionHandlers,
          }),
        { prefix: '/auth' },
      );
      await registerTenantModule(api, dependencies.tenantHandlers);
    },
    { prefix: '/api' },
  );
}

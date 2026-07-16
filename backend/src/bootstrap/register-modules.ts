import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { registerAuthentication } from './auth/register-authentication.js';
import { registerAuthorization } from './authorization/register-authorization.js';
import {
  createIamDependencies,
  registerAuthModule,
  registerIamModule,
  registerMembershipModule,
  registerPermissionModule,
  registerRoleModule,
  registerTenantModule,
} from '../modules/iam/iam.module.js';
import {
  createNutritionDependencies,
  registerNutritionModule,
} from '../modules/nutrition/nutrition.module.js';
import {
  createPatientDependencies,
  registerPatientModule,
} from '../modules/patient/patient.module.js';
import { getPlatformEventRuntime } from '../core/composition/platform-event-runtime.js';
import {
  registerDeprecatedHealthAlias,
  registerHealthRoutes,
} from './routes/health.js';

export async function registerModules(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  const platformEventRuntime = getPlatformEventRuntime();
  const dependencies = createIamDependencies(
    env,
    platformEventRuntime.eventDispatcher,
  );
  createNutritionDependencies(env, platformEventRuntime.eventDispatcher);
  createPatientDependencies(env, platformEventRuntime.eventDispatcher);

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
      await registerMembershipModule(api, dependencies.membershipHandlers);
      await registerRoleModule(api, dependencies.roleHandlers);
      await registerPermissionModule(api, dependencies.permissionHandlers);
      await registerNutritionModule(api);
      await registerPatientModule(api);
    },
    { prefix: '/api' },
  );
}

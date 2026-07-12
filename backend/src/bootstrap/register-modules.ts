import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { registerAuthModule, registerIamModule } from '../modules/iam/iam.module.js';
import {
  registerDeprecatedHealthAlias,
  registerHealthRoutes,
} from './routes/health.js';

export async function registerModules(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  await registerHealthRoutes(app);

  await app.register(
    async (api) => {
      await registerDeprecatedHealthAlias(api);
      await api.register(
        async (iamApi) => registerIamModule(iamApi, env),
        { prefix: '/iam' },
      );
      await api.register(
        async (authApi) => registerAuthModule(authApi, env),
        { prefix: '/auth' },
      );
    },
    { prefix: '/api' },
  );
}

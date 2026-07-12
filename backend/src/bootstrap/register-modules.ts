import type { FastifyInstance } from 'fastify';
import { registerIamModule } from '../modules/iam/iam.module.js';
import {
  registerDeprecatedHealthAlias,
  registerHealthRoutes,
} from './routes/health.js';

export async function registerModules(app: FastifyInstance): Promise<void> {
  await registerHealthRoutes(app);

  await app.register(
    async (api) => {
      await registerDeprecatedHealthAlias(api);
      await api.register(registerIamModule, { prefix: '/iam' });
    },
    { prefix: '/api' },
  );
}

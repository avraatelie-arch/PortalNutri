import type { FastifyInstance } from 'fastify';
import { registerIamModule } from '../modules/iam/iam.module.js';
import { registerHealthRoute } from './routes/health.js';

export async function registerModules(app: FastifyInstance): Promise<void> {
  await app.register(
    async (api) => {
      await registerHealthRoute(api);
      await api.register(registerIamModule, { prefix: '/iam' });
    },
    { prefix: '/api' },
  );
}

import type { FastifyInstance } from 'fastify';
import { registerModules } from './register-modules.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await registerModules(app);
}

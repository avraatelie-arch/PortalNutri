import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { registerModules } from './register-modules.js';

export async function registerRoutes(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  await registerModules(app, env);
}

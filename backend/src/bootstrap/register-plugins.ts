import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { registerGlobalValidation } from './validation/validator-compiler.js';

export async function registerPlugins(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  registerGlobalValidation(app);

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
  });
}

import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { registerSwagger } from './swagger/register-swagger.js';
import { registerGlobalValidation } from './validation/validator-compiler.js';

export async function registerPlugins(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  registerGlobalValidation(app);
  await registerSwagger(app, env);

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
  });
}

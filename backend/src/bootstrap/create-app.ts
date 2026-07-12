import fastify from 'fastify';
import { loadEnv } from '../config/env.js';
import { buildLoggerOptions } from '../config/logger.js';
import { buildRequestCorrelationOptions } from '../config/request-correlation.js';
import { registerPlugins } from './register-plugins.js';
import { registerRoutes } from './register-routes.js';
import { registerShutdownHooks } from './register-shutdown-hooks.js';

export async function createApp() {
  const env = loadEnv();

  const app = fastify({
    logger: buildLoggerOptions(env),
    ...buildRequestCorrelationOptions(),
  });

  await registerPlugins(app, env);
  await registerRoutes(app);
  registerShutdownHooks(app);

  return { app, env };
}

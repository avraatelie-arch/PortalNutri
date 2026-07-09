import fastify from 'fastify';
import { loadEnv } from '../config/env.js';
import { registerPlugins } from './register-plugins.js';
import { registerRoutes } from './register-routes.js';
import { registerShutdownHooks } from './register-shutdown-hooks.js';

export async function createApp() {
  const env = loadEnv();

  const app = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  await registerPlugins(app, env);
  await registerRoutes(app);
  registerShutdownHooks(app);

  return { app, env };
}

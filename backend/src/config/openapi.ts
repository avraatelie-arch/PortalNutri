import type { Env } from './env.js';
import { APP_NAME, APP_VERSION } from './app-metadata.js';

export function buildOpenApiConfig(env: Env) {
  const host = env.HOST === '0.0.0.0' ? 'localhost' : env.HOST;

  return {
    openapi: '3.0.0',
    info: {
      title: `${APP_NAME} API`,
      description: `${APP_NAME} Platform HTTP API`,
      version: APP_VERSION,
    },
    servers: [
      {
        url: `http://${host}:${env.PORT}`,
        description: `${env.NODE_ENV} server`,
      },
    ],
    tags: [
      {
        name: 'IAM',
        description: 'Identity and Access Management',
      },
    ],
  };
}

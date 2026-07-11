import type { Env } from './env.js';

export function buildOpenApiConfig(env: Env) {
  const host = env.HOST === '0.0.0.0' ? 'localhost' : env.HOST;

  return {
    openapi: '3.0.0',
    info: {
      title: 'PortalNutri API',
      description: 'PortalNutri Platform HTTP API',
      version: '1.0.0',
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

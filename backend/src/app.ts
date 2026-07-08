import fastify from 'fastify';
import cors from '@fastify/cors';

export function buildApp() {
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

  // Registo do CORS
  app.register(cors, {
    origin: '*', // Ajustar em produção
  });

  // Rota de Health Check
  app.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  return app;
}

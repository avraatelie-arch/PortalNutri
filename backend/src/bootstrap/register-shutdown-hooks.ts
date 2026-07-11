import type { FastifyInstance } from 'fastify';
import { disconnectPrismaClient } from '../core/database/prisma-client.js';

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'] as const;

export function registerShutdownHooks(app: FastifyInstance): void {
  for (const signal of SHUTDOWN_SIGNALS) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}. Shutting down gracefully...`);

      try {
        await app.close();
        process.exit(0);
      } catch (error) {
        app.log.error(error);
        process.exit(1);
      }
    });
  }

  app.addHook('onClose', async () => {
    await disconnectPrismaClient();
    app.log.info('Application shutdown completed.');
  });
}

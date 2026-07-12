import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  buildHealthResponse,
  buildLiveResponse,
  buildReadinessFailureResponse,
  buildReadinessSuccessResponse,
  runReadinessCheck,
} from '../health/health-checks.js';

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => buildHealthResponse());

  app.get('/health/live', async () => buildLiveResponse());

  app.get('/health/ready', async (_request, reply: FastifyReply) => {
    const { ready } = await runReadinessCheck();

    if (!ready) {
      return reply.status(503).send(buildReadinessFailureResponse());
    }

    return buildReadinessSuccessResponse();
  });
}

export async function registerDeprecatedHealthAlias(
  app: FastifyInstance,
): Promise<void> {
  app.get('/health', async () => buildHealthResponse());
}

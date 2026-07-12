import type { FastifyInstance } from 'fastify';
import { requestIdHeaderName } from '../../config/request-correlation.js';

export function registerRequestCorrelation(app: FastifyInstance): void {
  app.addHook('onSend', async (request, reply, payload) => {
    reply.header(requestIdHeaderName, request.id);
    return payload;
  });
}

import { randomUUID } from 'node:crypto';
import type { FastifyServerOptions } from 'fastify';

const REQUEST_ID_HEADER = 'x-request-id';

function readIncomingRequestId(
  headers: Record<string, string | string[] | undefined>,
): string | undefined {
  const incoming = headers[REQUEST_ID_HEADER];
  const value = Array.isArray(incoming) ? incoming[0] : incoming;

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return undefined;
}

export function buildRequestCorrelationOptions(): Pick<
  FastifyServerOptions,
  'requestIdHeader' | 'genReqId'
> {
  return {
    requestIdHeader: false,
    genReqId(req) {
      return readIncomingRequestId(req.headers) ?? randomUUID();
    },
  };
}

export const requestIdHeaderName = REQUEST_ID_HEADER;

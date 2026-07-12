import { randomUUID } from 'node:crypto';
import type { FastifyServerOptions } from 'fastify';

const REQUEST_ID_HEADER = 'x-request-id';
const MAX_REQUEST_ID_LENGTH = 128;

export function resolveRequestId(value: string | undefined): string {
  if (
    typeof value === 'string' &&
    value.length >= 1 &&
    value.length <= MAX_REQUEST_ID_LENGTH
  ) {
    return value;
  }

  return randomUUID();
}

function readIncomingRequestId(
  headers: Record<string, string | string[] | undefined>,
): string {
  const incoming = headers[REQUEST_ID_HEADER];
  const value = Array.isArray(incoming) ? incoming[0] : incoming;

  return resolveRequestId(value);
}

export function buildRequestCorrelationOptions(): Pick<
  FastifyServerOptions,
  'requestIdHeader' | 'genReqId'
> {
  return {
    requestIdHeader: false,
    genReqId(req) {
      return readIncomingRequestId(req.headers);
    },
  };
}

export const requestIdHeaderName = REQUEST_ID_HEADER;

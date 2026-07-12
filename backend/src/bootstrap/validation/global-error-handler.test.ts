import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import {
  GENERIC_INTERNAL_ERROR_MESSAGE,
  handleGlobalError,
} from './validator-compiler.js';

function createMockRequest() {
  const loggedErrors: unknown[] = [];

  const request = {
    log: {
      error(error: unknown) {
        loggedErrors.push(error);
      },
    },
  } as unknown as FastifyRequest;

  return { request, loggedErrors };
}

function createMockReply() {
  let statusCode = 0;
  let payload: unknown;

  const reply = {
    status(code: number) {
      statusCode = code;
      return {
        send(body: unknown) {
          payload = body;
        },
      };
    },
  } as unknown as FastifyReply;

  return {
    reply,
    getResponse() {
      return { statusCode, payload };
    },
  };
}

describe('handleGlobalError', () => {
  it('returns 400 for validation errors', () => {
    const { request } = createMockRequest();
    const { reply, getResponse } = createMockReply();

    handleGlobalError(
      {
        validation: [
          {
            keyword: 'invalid',
            instancePath: '/email',
            schemaPath: '',
            message: 'Invalid email',
            params: { path: 'email' },
          },
        ],
      } as FastifyError,
      request,
      reply,
    );

    const response = getResponse();

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.payload, {
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: [
        {
          keyword: 'invalid',
          instancePath: '/email',
          schemaPath: '',
          message: 'Invalid email',
          params: { path: 'email' },
        },
      ],
    });
  });

  it('returns a generic 500 response for unknown errors', () => {
    const { request, loggedErrors } = createMockRequest();
    const { reply, getResponse } = createMockReply();
    const error = new Error('database connection lost');

    handleGlobalError(error as FastifyError, request, reply);

    const response = getResponse();

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.payload, {
      statusCode: 500,
      error: 'Internal Server Error',
      message: GENERIC_INTERNAL_ERROR_MESSAGE,
    });
    assert.equal(loggedErrors.length, 1);
    assert.equal(loggedErrors[0], error);
  });
});

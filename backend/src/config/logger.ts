import type { FastifyServerOptions } from 'fastify';
import type { Env } from './env.js';

type LoggerOptions = NonNullable<FastifyServerOptions['logger']>;

export function buildLoggerOptions(env: Env): LoggerOptions {
  if (env.NODE_ENV === 'test') {
    return { level: 'silent' };
  }

  const options: LoggerOptions = {
    level: env.LOG_LEVEL,
  };

  const usePretty =
    env.NODE_ENV === 'development' && env.LOG_PRETTY;

  if (usePretty) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    };
  }

  return options;
}

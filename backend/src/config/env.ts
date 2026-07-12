import { z } from 'zod';
import { loadDotenv } from './dotenv.js';

const booleanEnvSchema = z.enum(['true', 'false'], {
  errorMap: () => ({ message: 'Must be "true" or "false"' }),
});

function isPostgresDatabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'postgresql:' || url.protocol === 'postgres:';
  }
  catch {
    return false;
  }
}

function formatEnvValidationError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'environment';
    return `  - ${path}: ${issue.message}`;
  });

  return `Invalid environment configuration:\n${issues.join('\n')}`;
}

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce
      .number({
        invalid_type_error: 'PORT must be an integer between 1 and 65535',
      })
      .int('PORT must be an integer between 1 and 65535')
      .min(1, 'PORT must be an integer between 1 and 65535')
      .max(65535, 'PORT must be an integer between 1 and 65535')
      .default(3333),
    HOST: z
      .string()
      .min(1, 'HOST must be a non-empty string')
      .default('0.0.0.0'),
    DATABASE_URL: z
      .string({
        required_error: 'DATABASE_URL is required',
      })
      .min(1, 'DATABASE_URL is required')
      .refine(
        isPostgresDatabaseUrl,
        'DATABASE_URL must be a valid PostgreSQL connection URL',
      ),
    CORS_ORIGIN: z
      .string()
      .min(1, 'CORS_ORIGIN must be a non-empty string')
      .default('*'),
    OPENAPI_ENABLED: booleanEnvSchema
      .optional()
      .transform((value) => {
        if (value === 'true') {
          return true;
        }

        if (value === 'false') {
          return false;
        }

        return undefined;
      }),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'], {
        errorMap: () => ({
          message:
            'LOG_LEVEL must be one of trace, debug, info, warn, error, fatal, silent',
        }),
      })
      .default('info'),
    LOG_PRETTY: booleanEnvSchema
      .optional()
      .transform((value) => {
        if (value === 'true') {
          return true;
        }

        if (value === 'false') {
          return false;
        }

        return undefined;
      }),
  })
  .transform((data) => ({
    ...data,
    OPENAPI_ENABLED:
      data.OPENAPI_ENABLED ?? data.NODE_ENV !== 'production',
    LOG_PRETTY: data.LOG_PRETTY ?? data.NODE_ENV === 'development',
  }));

export type Env = z.infer<typeof envSchema>;

export function parseEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>,
): Env {
  try {
    return envSchema.parse(source);
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(formatEnvValidationError(error));
    }

    throw error;
  }
}

export function loadEnv(): Env {
  loadDotenv();
  return parseEnv(process.env);
}

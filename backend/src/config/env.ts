import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3333),
    HOST: z.string().default('0.0.0.0'),
    CORS_ORIGIN: z.string().default('*'),
    OPENAPI_ENABLED: z
      .enum(['true', 'false'])
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
  }));

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  return envSchema.parse(process.env);
}

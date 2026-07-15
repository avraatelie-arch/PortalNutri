import { z } from 'zod';

export const tenantIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createTenantBodySchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const tenantStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const tenantResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: tenantStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateTenantBody = z.infer<typeof createTenantBodySchema>;

export const httpErrorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['statusCode', 'error', 'message'],
} as const;

import { z } from 'zod';
import { httpErrorResponseSchema } from './tenant.schemas.js';

export const membershipIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const membershipDeleteParamsSchema = z.object({
  personId: z.string().uuid(),
  tenantId: z.string().uuid(),
});

export const createMembershipBodySchema = z.object({
  personId: z.string().uuid(),
  tenantId: z.string().uuid(),
});

export const membershipStatusSchema = z.enum(['ACTIVE', 'REMOVED']);

export const membershipResponseSchema = z.object({
  id: z.string().uuid(),
  personId: z.string().uuid(),
  tenantId: z.string().uuid(),
  status: membershipStatusSchema,
  createdAt: z.string(),
  reactivatedAt: z.string().nullable(),
  removedAt: z.string().nullable(),
});

export type CreateMembershipBody = z.infer<typeof createMembershipBodySchema>;

export { httpErrorResponseSchema };

export const membershipResponseJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    personId: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['ACTIVE', 'REMOVED'] },
    createdAt: { type: 'string' },
    reactivatedAt: { type: ['string', 'null'] },
    removedAt: { type: ['string', 'null'] },
  },
  required: [
    'id',
    'personId',
    'tenantId',
    'status',
    'createdAt',
    'reactivatedAt',
    'removedAt',
  ],
} as const;

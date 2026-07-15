import { z } from 'zod';
import { httpErrorResponseSchema } from './tenant.schemas.js';

export const roleIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createRoleBodySchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().trim().min(2).max(200),
});

export const roleResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  createdAt: z.string(),
});

export const roleAssignmentIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createRoleAssignmentBodySchema = z.object({
  membershipId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const roleAssignmentDeleteParamsSchema = z.object({
  membershipId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const roleAssignmentStatusSchema = z.enum(['ACTIVE', 'REMOVED']);

export const roleAssignmentResponseSchema = z.object({
  id: z.string().uuid(),
  membershipId: z.string().uuid(),
  roleId: z.string().uuid(),
  status: roleAssignmentStatusSchema,
  createdAt: z.string(),
  reactivatedAt: z.string().nullable(),
  removedAt: z.string().nullable(),
});

export type CreateRoleBody = z.infer<typeof createRoleBodySchema>;
export type CreateRoleAssignmentBody = z.infer<typeof createRoleAssignmentBodySchema>;

export { httpErrorResponseSchema };

export const roleResponseJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'tenantId', 'name', 'createdAt'],
} as const;

export const roleAssignmentResponseJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    membershipId: { type: 'string', format: 'uuid' },
    roleId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['ACTIVE', 'REMOVED'] },
    createdAt: { type: 'string' },
    reactivatedAt: { type: ['string', 'null'] },
    removedAt: { type: ['string', 'null'] },
  },
  required: [
    'id',
    'membershipId',
    'roleId',
    'status',
    'createdAt',
    'reactivatedAt',
    'removedAt',
  ],
} as const;

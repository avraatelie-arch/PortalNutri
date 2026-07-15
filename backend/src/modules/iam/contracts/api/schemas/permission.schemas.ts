import { z } from 'zod';
import { httpErrorResponseSchema } from './tenant.schemas.js';

export const permissionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createPermissionBodySchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().trim().min(2).max(200),
});

export const permissionResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  createdAt: z.string(),
});

export const permissionAssignmentIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createPermissionAssignmentBodySchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export const permissionAssignmentDeleteParamsSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export const permissionAssignmentStatusSchema = z.enum(['ACTIVE', 'REMOVED']);

export const permissionAssignmentResponseSchema = z.object({
  id: z.string().uuid(),
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
  status: permissionAssignmentStatusSchema,
  createdAt: z.string(),
  reactivatedAt: z.string().nullable(),
  removedAt: z.string().nullable(),
});

export type CreatePermissionBody = z.infer<typeof createPermissionBodySchema>;
export type CreatePermissionAssignmentBody = z.infer<
  typeof createPermissionAssignmentBodySchema
>;

export { httpErrorResponseSchema };

export const permissionResponseJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'tenantId', 'name', 'createdAt'],
} as const;

export const permissionAssignmentResponseJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    roleId: { type: 'string', format: 'uuid' },
    permissionId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['ACTIVE', 'REMOVED'] },
    createdAt: { type: 'string' },
    reactivatedAt: { type: ['string', 'null'] },
    removedAt: { type: ['string', 'null'] },
  },
  required: [
    'id',
    'roleId',
    'permissionId',
    'status',
    'createdAt',
    'reactivatedAt',
    'removedAt',
  ],
} as const;

import { z } from 'zod';
import { DocumentType } from '../../../domain/value-objects/document.js';

export const personIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createPersonBodySchema = z.object({
  fullName: z.string().min(1),
  preferredName: z.string().nullable().optional(),
  email: z.string().min(1),
  documentType: z.nativeEnum(DocumentType),
  documentValue: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().nullable().optional(),
});

export const updatePersonBodySchema = z
  .object({
    fullName: z.string().min(1).optional(),
    preferredName: z.string().nullable().optional(),
    email: z.string().min(1).optional(),
    phone: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.preferredName !== undefined ||
      data.email !== undefined ||
      data.phone !== undefined,
    {
      message: 'At least one updateable field must be provided.',
    },
  );

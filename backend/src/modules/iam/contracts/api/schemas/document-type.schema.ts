import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'CPF',
  'RG',
  'CNH',
  'PASSPORT',
  'OTHER',
]);

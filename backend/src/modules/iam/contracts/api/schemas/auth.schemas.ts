import { z } from 'zod';

export const registerCredentialBodySchema = z.object({
  personId: z.string().uuid(),
  password: z.string().min(8),
});

export type RegisterCredentialBody = z.infer<typeof registerCredentialBodySchema>;

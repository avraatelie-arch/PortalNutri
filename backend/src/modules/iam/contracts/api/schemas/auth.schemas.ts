import { z } from 'zod';

export const registerCredentialBodySchema = z.object({
  personId: z.string().uuid(),
  password: z.string().min(8),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const authTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string().datetime(),
  sessionId: z.string().uuid(),
});

export const meResponseSchema = z.object({
  personId: z.string().uuid(),
  sessionId: z.string().uuid(),
  tenantId: z.null(),
});

export type RegisterCredentialBody = z.infer<typeof registerCredentialBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;

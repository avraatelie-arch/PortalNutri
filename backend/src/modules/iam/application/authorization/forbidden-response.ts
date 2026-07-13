export const FORBIDDEN_MESSAGE = 'Access denied.';

export function buildForbiddenResponse() {
  return {
    statusCode: 403,
    error: 'Forbidden',
    message: FORBIDDEN_MESSAGE,
  } as const;
}

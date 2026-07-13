export const UNAUTHORIZED_MESSAGE = 'Authentication required.';

export function buildUnauthorizedResponse() {
  return {
    statusCode: 401,
    error: 'Unauthorized',
    message: UNAUTHORIZED_MESSAGE,
  };
}

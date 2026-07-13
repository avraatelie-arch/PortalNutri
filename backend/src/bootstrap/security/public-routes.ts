const ALWAYS_PUBLIC_PATHS = new Set([
  '/health',
  '/health/live',
  '/health/ready',
  '/api/health',
  '/api/auth/login',
  '/api/auth/refresh',
]);

const CREDENTIALS_PATH = '/api/auth/credentials';

function normalizePath(url: string): string {
  const [path] = url.split('?');
  return path ?? url;
}

function isDocsPath(path: string): boolean {
  return path === '/docs' || path.startsWith('/docs/');
}

export function isPublicRoute(
  method: string,
  url: string,
  credentialRegistrationEnabled: boolean,
): boolean {
  if (method === 'OPTIONS') {
    return true;
  }

  const path = normalizePath(url);

  if (ALWAYS_PUBLIC_PATHS.has(path)) {
    return true;
  }

  if (isDocsPath(path)) {
    return true;
  }

  if (path === CREDENTIALS_PATH && credentialRegistrationEnabled) {
    return true;
  }

  return false;
}

import { getPrismaClient } from '../../core/database/prisma-client.js';
import { APP_NAME, APP_VERSION } from '../../config/app-metadata.js';

export type CheckStatus = 'up' | 'down';

export interface ReadinessProbe {
  ping(): Promise<void>;
}

export function createDefaultReadinessProbe(): ReadinessProbe {
  return {
    async ping() {
      await getPrismaClient().$queryRaw`SELECT 1`;
    },
  };
}

export async function runReadinessCheck(
  probe: ReadinessProbe = createDefaultReadinessProbe(),
): Promise<{ ready: boolean }> {
  try {
    await probe.ping();
    return { ready: true };
  }
  catch {
    return { ready: false };
  }
}

export function buildHealthResponse() {
  return {
    status: 'ok' as const,
    application: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

export function buildLiveResponse() {
  return {
    status: 'alive' as const,
  };
}

export function buildReadinessSuccessResponse() {
  return {
    status: 'ready' as const,
    checks: {
      database: 'up' as const,
      prisma: 'up' as const,
    },
  };
}

export function buildReadinessFailureResponse() {
  return {
    status: 'not_ready' as const,
    checks: {
      database: 'down' as const,
      prisma: 'down' as const,
    },
  };
}

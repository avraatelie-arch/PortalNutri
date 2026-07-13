import type { AuditLogger } from '../../application/audit/audit-logger.js';

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export class DefaultAuditLogger implements AuditLogger {
  logAuditFailure(params: {
    eventName: string;
    error: unknown;
  }): void {
    console.error(
      {
        eventName: params.eventName,
        err: serializeError(params.error),
      },
      'Audit recording failed',
    );
  }
}

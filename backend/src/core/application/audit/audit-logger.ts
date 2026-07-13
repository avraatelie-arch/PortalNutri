export interface AuditLogger {
  logAuditFailure(params: {
    eventName: string;
    error: unknown;
  }): void;
}

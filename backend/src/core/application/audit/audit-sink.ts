import type { AuditEntry } from './audit-entry.js';

export interface AuditSink {
  save(entry: AuditEntry): Promise<void>;
}

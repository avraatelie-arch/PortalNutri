import type { AuditEntry } from '../../application/audit/audit-entry.js';
import type { AuditSink } from '../../application/audit/audit-sink.js';

export class InMemoryAuditSink implements AuditSink {
  private readonly entries: AuditEntry[] = [];

  async save(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }

  getEntries(): readonly AuditEntry[] {
    return this.entries;
  }

  clear(): void {
    this.entries.length = 0;
  }
}

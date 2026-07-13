import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAuditEntryFromPlatformEvent } from '../../application/audit/audit-entry.js';
import type { PlatformEvent } from '../../application/events/platform-event.js';
import { InMemoryAuditSink } from './in-memory-audit-sink.js';

class TestEvent implements PlatformEvent {
  readonly eventName = 'TestEvent';
  readonly occurredAt = new Date();
}

describe('InMemoryAuditSink', () => {
  it('stores audit entries in memory', async () => {
    const sink = new InMemoryAuditSink();
    const entry = createAuditEntryFromPlatformEvent(new TestEvent());

    await sink.save(entry);

    assert.equal(sink.getEntries().length, 1);
    assert.equal(sink.getEntries()[0]?.id, entry.id);
  });
});

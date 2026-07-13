import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AuditEntry } from '../../application/audit/audit-entry.js';
import type { AuditLogger } from '../../application/audit/audit-logger.js';
import type { AuditSink } from '../../application/audit/audit-sink.js';
import type { PlatformEvent } from '../../application/events/platform-event.js';
import { DefaultAuditPublisher } from './default-audit-publisher.js';

class TestEvent implements PlatformEvent {
  constructor(
    readonly eventName: string,
    readonly occurredAt = new Date(),
    readonly personId?: string,
  ) {}
}

class RecordingAuditLogger implements AuditLogger {
  failures: Array<{ eventName: string; error: unknown }> = [];

  logAuditFailure(params: { eventName: string; error: unknown }): void {
    this.failures.push(params);
  }
}

class FailingAuditSink implements AuditSink {
  readonly saved: AuditEntry[] = [];
  shouldFail = false;

  async save(entry: AuditEntry): Promise<void> {
    if (this.shouldFail) {
      throw new Error('sink failed');
    }

    this.saved.push(entry);
  }
}

describe('DefaultAuditPublisher', () => {
  it('records one audit entry per event', async () => {
    const sink = new FailingAuditSink();
    const publisher = new DefaultAuditPublisher(sink, new RecordingAuditLogger());

    await publisher.record(new TestEvent('PersonCreated', new Date(), 'person-1'));

    assert.equal(sink.saved.length, 1);
    assert.equal(sink.saved[0]?.eventName, 'PersonCreated');
    assert.equal(sink.saved[0]?.personId, 'person-1');
  });

  it('records multiple events as separate entries', async () => {
    const sink = new FailingAuditSink();
    const publisher = new DefaultAuditPublisher(sink, new RecordingAuditLogger());

    await publisher.record(new TestEvent('EventOne'));
    await publisher.record(new TestEvent('EventTwo'));

    assert.equal(sink.saved.length, 2);
    assert.equal(sink.saved[0]?.eventName, 'EventOne');
    assert.equal(sink.saved[1]?.eventName, 'EventTwo');
  });

  it('logs sink failures without throwing', async () => {
    const sink = new FailingAuditSink();
    sink.shouldFail = true;
    const logger = new RecordingAuditLogger();
    const publisher = new DefaultAuditPublisher(sink, logger);

    await assert.doesNotReject(async () => {
      await publisher.record(new TestEvent('FailureEvent'));
    });

    assert.equal(logger.failures.length, 1);
    assert.equal(logger.failures[0]?.eventName, 'FailureEvent');
    assert.equal(sink.saved.length, 0);
  });

  it('logs metadata cloning failures without throwing', async () => {
    const sink = new FailingAuditSink();
    const logger = new RecordingAuditLogger();
    const publisher = new DefaultAuditPublisher(sink, logger);
    const circular: PlatformEvent & { self?: unknown } = {
      eventName: 'CircularEvent',
      occurredAt: new Date(),
      self: undefined,
    };
    circular.self = circular;

    await assert.doesNotReject(async () => {
      await publisher.record(circular);
    });

    assert.equal(logger.failures.length, 1);
    assert.equal(logger.failures[0]?.eventName, 'CircularEvent');
    assert.equal(sink.saved.length, 0);
  });
});

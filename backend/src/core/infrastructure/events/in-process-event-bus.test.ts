import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AuditEntry } from '../../application/audit/audit-entry.js';
import type { AuditLogger } from '../../application/audit/audit-logger.js';
import type { AuditSink } from '../../application/audit/audit-sink.js';
import type { EventBusLogger } from '../../application/events/event-bus-logger.js';
import type { EventHandler } from '../../application/events/event-handler.js';
import type { PlatformEvent } from '../../application/events/platform-event.js';
import { AuditEventHandler } from '../audit/audit-event-handler.js';
import { DefaultAuditPublisher } from '../audit/default-audit-publisher.js';
import { InMemoryAuditSink } from '../audit/in-memory-audit-sink.js';
import { EventHandlerRegistry } from './event-handler-registry.js';
import { InProcessEventBus } from './in-process-event-bus.js';

class TestEvent implements PlatformEvent {
  constructor(
    readonly eventName: string,
    readonly occurredAt = new Date(),
  ) {}
}

class RecordingLogger implements EventBusLogger {
  failures: Array<{
    eventName: string;
    handlerName: string;
    error: unknown;
  }> = [];

  logHandlerFailure(params: {
    eventName: string;
    handlerName: string;
    error: unknown;
  }): void {
    this.failures.push(params);
  }
}

class RecordingAuditLogger implements AuditLogger {
  failures: Array<{ eventName: string; error: unknown }> = [];

  logAuditFailure(params: { eventName: string; error: unknown }): void {
    this.failures.push(params);
  }
}

class FailingAuditSink implements AuditSink {
  shouldFail = false;

  async save(_entry: AuditEntry): Promise<void> {
    if (this.shouldFail) {
      throw new Error('audit sink failed');
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('InProcessEventBus', () => {
  it('invokes a single handler asynchronously', async () => {
    const registry = new EventHandlerRegistry();
    const logger = new RecordingLogger();
    const bus = new InProcessEventBus(registry, logger);
    let handled = false;

    registry.register(
      'SingleEvent',
      {
        handlerName: 'single-handler',
        async handle() {
          await delay(1);
          handled = true;
        },
      },
    );

    await bus.publish(new TestEvent('SingleEvent'));

    assert.equal(handled, true);
  });

  it('invokes multiple handlers for the same event', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    const calls: string[] = [];

    registry.register('MultiEvent', {
      handlerName: 'handler-a',
      async handle() {
        calls.push('a');
      },
    });
    registry.register('MultiEvent', {
      handlerName: 'handler-b',
      async handle() {
        calls.push('b');
      },
    });

    await bus.publish(new TestEvent('MultiEvent'));

    assert.deepEqual(calls, ['a', 'b']);
  });

  it('preserves handler registration order', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    const calls: string[] = [];

    const handlers: EventHandler[] = [
      {
        handlerName: 'first',
        async handle() {
          calls.push('first');
        },
      },
      {
        handlerName: 'second',
        async handle() {
          calls.push('second');
        },
      },
      {
        handlerName: 'third',
        async handle() {
          calls.push('third');
        },
      },
    ];

    for (const handler of handlers) {
      registry.register('OrderedEvent', handler);
    }

    await bus.publish(new TestEvent('OrderedEvent'));

    assert.deepEqual(calls, ['first', 'second', 'third']);
  });

  it('is a no-op when zero handlers are registered', async () => {
    const bus = new InProcessEventBus(
      new EventHandlerRegistry(),
      new RecordingLogger(),
    );

    await assert.doesNotReject(async () => {
      await bus.publish(new TestEvent('MissingEvent'));
    });
  });

  it('isolates handler failures and continues with the next handler', async () => {
    const registry = new EventHandlerRegistry();
    const logger = new RecordingLogger();
    const bus = new InProcessEventBus(registry, logger);
    const calls: string[] = [];

    registry.register('FailureEvent', {
      handlerName: 'failing-handler',
      async handle() {
        calls.push('failing');
        throw new Error('handler failed');
      },
    });
    registry.register('FailureEvent', {
      handlerName: 'next-handler',
      async handle() {
        calls.push('next');
      },
    });

    await bus.publish(new TestEvent('FailureEvent'));

    assert.deepEqual(calls, ['failing', 'next']);
    assert.equal(logger.failures.length, 1);
    assert.equal(logger.failures[0]?.eventName, 'FailureEvent');
    assert.equal(logger.failures[0]?.handlerName, 'failing-handler');
    assert.equal(
      (logger.failures[0]?.error as Error).message,
      'handler failed',
    );
  });

  it('continues publishing later events after a handler failure', async () => {
    const registry = new EventHandlerRegistry();
    const logger = new RecordingLogger();
    const bus = new InProcessEventBus(registry, logger);
    const calls: string[] = [];

    registry.register('FirstEvent', {
      handlerName: 'first-event-handler',
      async handle() {
        calls.push('first-event');
        throw new Error('first failed');
      },
    });
    registry.register('SecondEvent', {
      handlerName: 'second-event-handler',
      async handle() {
        calls.push('second-event');
      },
    });

    await bus.publishAll([
      new TestEvent('FirstEvent'),
      new TestEvent('SecondEvent'),
    ]);

    assert.deepEqual(calls, ['first-event', 'second-event']);
    assert.equal(logger.failures.length, 1);
  });

  it('publishes multiple events sequentially', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    const calls: string[] = [];

    registry.register('EventOne', {
      handlerName: 'event-one-handler',
      async handle() {
        calls.push('one');
      },
    });
    registry.register('EventTwo', {
      handlerName: 'event-two-handler',
      async handle() {
        calls.push('two');
      },
    });

    await bus.publishAll([
      new TestEvent('EventOne'),
      new TestEvent('EventTwo'),
    ]);

    assert.deepEqual(calls, ['one', 'two']);
  });

  it('invokes global handlers after event-specific handlers', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    const calls: string[] = [];

    registry.register('OrderedEvent', {
      handlerName: 'specific-handler',
      async handle() {
        calls.push('specific');
      },
    });
    registry.registerGlobal({
      handlerName: 'global-handler',
      async handle() {
        calls.push('global');
      },
    });

    await bus.publish(new TestEvent('OrderedEvent'));

    assert.deepEqual(calls, ['specific', 'global']);
  });

  it('invokes global handlers when no event-specific handlers exist', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    let globalHandled = false;

    registry.registerGlobal({
      handlerName: 'global-only',
      async handle() {
        globalHandled = true;
      },
    });

    await bus.publish(new TestEvent('UnhandledEvent'));

    assert.equal(globalHandled, true);
  });

  it('routes every platform event to global audit handler after dispatch', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    const sink = new InMemoryAuditSink();
    const calls: string[] = [];

    registry.register('AuditedEvent', {
      handlerName: 'business-handler',
      async handle() {
        calls.push('business');
      },
    });
    registry.registerGlobal(
      new AuditEventHandler(
        new DefaultAuditPublisher(sink, new RecordingAuditLogger()),
      ),
    );

    await bus.publishAll([
      new TestEvent('AuditedEvent'),
      new TestEvent('OnlyGlobalEvent'),
    ]);

    assert.deepEqual(calls, ['business']);
    assert.equal(sink.getEntries().length, 2);
    assert.equal(sink.getEntries()[0]?.eventName, 'AuditedEvent');
    assert.equal(sink.getEntries()[1]?.eventName, 'OnlyGlobalEvent');
  });

  it('continues later events when audit recording fails', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    const sink = new FailingAuditSink();
    const logger = new RecordingAuditLogger();

    sink.shouldFail = true;

    registry.registerGlobal(
      new AuditEventHandler(new DefaultAuditPublisher(sink, logger)),
    );

    await bus.publishAll([
      new TestEvent('FirstEvent'),
      new TestEvent('SecondEvent'),
    ]);

    assert.equal(logger.failures.length, 2);
    assert.equal(logger.failures[0]?.eventName, 'FirstEvent');
    assert.equal(logger.failures[1]?.eventName, 'SecondEvent');
  });

  it('continues global handlers after a failing event-specific handler', async () => {
    const registry = new EventHandlerRegistry();
    const bus = new InProcessEventBus(registry, new RecordingLogger());
    const sink = new InMemoryAuditSink();
    const calls: string[] = [];

    registry.register('FailureEvent', {
      handlerName: 'failing-business-handler',
      async handle() {
        calls.push('business');
        throw new Error('business failed');
      },
    });
    registry.registerGlobal(
      new AuditEventHandler(
        new DefaultAuditPublisher(sink, new RecordingAuditLogger()),
      ),
    );

    await bus.publish(new TestEvent('FailureEvent'));

    assert.deepEqual(calls, ['business']);
    assert.equal(sink.getEntries().length, 1);
  });
});

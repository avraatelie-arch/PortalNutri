import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventHandler } from '../../application/events/event-handler.js';
import type { PlatformEvent } from '../../application/events/platform-event.js';
import { EventHandlerRegistry } from './event-handler-registry.js';

class TestEvent implements PlatformEvent {
  readonly eventName = 'TestEvent';
  readonly occurredAt = new Date();
}

describe('EventHandlerRegistry', () => {
  it('returns handlers in registration order', () => {
    const registry = new EventHandlerRegistry();

    const first: EventHandler = {
      handlerName: 'first',
      async handle() {},
    };
    const second: EventHandler = {
      handlerName: 'second',
      async handle() {},
    };

    registry.register('TestEvent', first);
    registry.register('TestEvent', second);

    const handlers = registry.getHandlers('TestEvent');

    assert.equal(handlers.length, 2);
    assert.equal(handlers[0]?.handlerName, 'first');
    assert.equal(handlers[1]?.handlerName, 'second');
  });

  it('returns an empty list when no handlers are registered', () => {
    const registry = new EventHandlerRegistry();

    assert.deepEqual(registry.getHandlers('MissingEvent'), []);
  });

  it('returns global handlers in registration order', () => {
    const registry = new EventHandlerRegistry();

    const first: EventHandler = {
      handlerName: 'global-first',
      async handle() {},
    };
    const second: EventHandler = {
      handlerName: 'global-second',
      async handle() {},
    };

    registry.registerGlobal(first);
    registry.registerGlobal(second);

    const handlers = registry.getGlobalHandlers();

    assert.equal(handlers.length, 2);
    assert.equal(handlers[0]?.handlerName, 'global-first');
    assert.equal(handlers[1]?.handlerName, 'global-second');
  });

  it('keeps event-specific and global handlers separate', () => {
    const registry = new EventHandlerRegistry();

    registry.register('TestEvent', {
      handlerName: 'specific',
      async handle() {},
    });
    registry.registerGlobal({
      handlerName: 'global',
      async handle() {},
    });

    assert.equal(registry.getHandlers('TestEvent').length, 1);
    assert.equal(registry.getGlobalHandlers().length, 1);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PlatformEvent } from './platform-event.js';
import { EventDispatcher } from './event-dispatcher.js';

class TestEvent implements PlatformEvent {
  readonly eventName = 'TestEvent';
  readonly occurredAt = new Date();
}

describe('EventDispatcher', () => {
  it('delegates platform events to the publisher', async () => {
    const published: PlatformEvent[] = [];
    const dispatcher = new EventDispatcher({
      async publish(event) {
        published.push(event);
      },
      async publishAll(events) {
        published.push(...events);
      },
    });

    const event = new TestEvent();
    await dispatcher.dispatch([event, { not: 'an-event' }]);

    assert.equal(published.length, 1);
    assert.equal(published[0]?.eventName, 'TestEvent');
  });

  it('skips dispatch for empty lists', async () => {
    let publishCount = 0;
    const dispatcher = new EventDispatcher({
      async publish() {
        publishCount += 1;
      },
      async publishAll() {
        publishCount += 1;
      },
    });

    await dispatcher.dispatch([]);

    assert.equal(publishCount, 0);
  });
});

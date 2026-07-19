import type { Clock } from '../modules/appointment/application/ports/clock.port.js';

export class FixedClock implements Clock {
  constructor(private readonly fixedNow: Date) {}

  now(): Date {
    return new Date(this.fixedNow);
  }
}

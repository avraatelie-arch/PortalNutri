import { DomainError } from '../errors/domain-error.js';

export const FREQUENCY_DISPLAY_TEXT_MAX_LENGTH = 200;
export const FREQUENCY_TIMES_PER_DAY_MAX = 24;
export const FREQUENCY_INTERVAL_HOURS_MAX = 168;

export class Frequency {
  private constructor(
    private readonly displayText: string,
    private readonly timesPerDay: number | null,
    private readonly intervalHours: number | null,
  ) {}

  static empty(): Frequency {
    return new Frequency('', null, null);
  }

  static create(params: {
    displayText?: string | null;
    timesPerDay?: number | null;
    intervalHours?: number | null;
  }): Frequency {
    const displayText = normalizeDisplayText(params.displayText ?? '');

    if (displayText.length > FREQUENCY_DISPLAY_TEXT_MAX_LENGTH) {
      throw new DomainError(
        `Frequency display text must not exceed ${FREQUENCY_DISPLAY_TEXT_MAX_LENGTH} characters.`,
      );
    }

    const timesPerDay = normalizeOptionalPositiveInt(
      params.timesPerDay,
      'timesPerDay',
      FREQUENCY_TIMES_PER_DAY_MAX,
    );
    const intervalHours = normalizeOptionalPositiveInt(
      params.intervalHours,
      'intervalHours',
      FREQUENCY_INTERVAL_HOURS_MAX,
    );

    return new Frequency(displayText, timesPerDay, intervalHours);
  }

  static fromPersistence(params: {
    displayText: string | null | undefined;
    timesPerDay: number | null | undefined;
    intervalHours: number | null | undefined;
  }): Frequency {
    return new Frequency(
      params.displayText ?? '',
      params.timesPerDay ?? null,
      params.intervalHours ?? null,
    );
  }

  equals(other: Frequency): boolean {
    return (
      this.displayText === other.displayText
      && this.timesPerDay === other.timesPerDay
      && this.intervalHours === other.intervalHours
    );
  }

  isEmpty(): boolean {
    return this.displayText.length === 0;
  }

  isCompleteForEmit(): boolean {
    return this.displayText.length > 0;
  }

  getDisplayText(): string {
    return this.displayText;
  }

  getTimesPerDay(): number | null {
    return this.timesPerDay;
  }

  getIntervalHours(): number | null {
    return this.intervalHours;
  }
}

function normalizeDisplayText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeOptionalPositiveInt(
  value: number | null | undefined,
  fieldName: string,
  max: number,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new DomainError(`${fieldName} must be a positive integer.`);
  }

  if (value > max) {
    throw new DomainError(`${fieldName} must not exceed ${max}.`);
  }

  return value;
}

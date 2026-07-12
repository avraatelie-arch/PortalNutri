const DURATION_PATTERN = /^(\d+)([smhd])$/;

const MULTIPLIERS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationToMs(value: string): number {
  const normalized = value.trim();
  const match = DURATION_PATTERN.exec(normalized);

  if (!match) {
    throw new Error(
      `Invalid duration "${value}". Expected format like 15m, 7d, or 30d.`,
    );
  }

  const amount = Number(match[1]);
  const unit = match[2]!;

  return amount * MULTIPLIERS[unit]!;
}

export function addDuration(base: Date, duration: string): Date {
  return new Date(base.getTime() + parseDurationToMs(duration));
}

export function minDate(first: Date, second: Date): Date {
  return first.getTime() <= second.getTime() ? first : second;
}

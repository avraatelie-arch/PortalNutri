import type { Env } from './env.js';

export interface Argon2Config {
  timeCost: number;
  memoryCost: number;
  parallelism: number;
}

export function buildArgon2Config(env: Env): Argon2Config {
  return {
    timeCost: env.ARGON2_TIME_COST,
    memoryCost: env.ARGON2_MEMORY_COST,
    parallelism: env.ARGON2_PARALLELISM,
  };
}

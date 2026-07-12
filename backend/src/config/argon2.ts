import type { Env } from './env.js';
import type { Argon2Config } from '../modules/iam/infrastructure/cryptography/argon2-password-hasher.js';

export function buildArgon2Config(env: Env): Argon2Config {
  return {
    timeCost: env.ARGON2_TIME_COST,
    memoryCost: env.ARGON2_MEMORY_COST,
    parallelism: env.ARGON2_PARALLELISM,
  };
}

import type { PasswordHasher } from '../../domain/services/password-hasher.port.js';

export interface Argon2Config {
  timeCost: number;
  memoryCost: number;
  parallelism: number;
}

export class Argon2PasswordHasher implements PasswordHasher {
  constructor(private readonly config: Argon2Config) {}

  async hash(plainPassword: string): Promise<string> {
    const argon2 = await import('argon2');

    return argon2.hash(plainPassword, {
      type: argon2.argon2id,
      timeCost: this.config.timeCost,
      memoryCost: this.config.memoryCost,
      parallelism: this.config.parallelism,
    });
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    const argon2 = await import('argon2');

    return argon2.verify(hash, plainPassword);
  }
}

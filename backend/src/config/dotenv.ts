import { config as loadDotenvConfig } from 'dotenv';

let dotenvLoaded = false;

export function loadDotenv(): void {
  if (dotenvLoaded) {
    return;
  }

  loadDotenvConfig();
  dotenvLoaded = true;
}

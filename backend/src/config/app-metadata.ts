import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const packageJsonPath = join(__dirname, '../../package.json');
const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  version: string;
};

export const APP_NAME = 'PortalNutri';
export const APP_VERSION = version;

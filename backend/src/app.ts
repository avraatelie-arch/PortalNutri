import { createApp } from './bootstrap/index.js';

export async function buildApp() {
  const { app } = await createApp();
  return app;
}

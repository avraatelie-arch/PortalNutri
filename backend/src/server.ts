import 'dotenv/config';
import { createApp } from './bootstrap/index.js';

const start = async () => {
  try {
    const { app, env } = await createApp();

    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(
      `PortalNutri backend running at http://${env.HOST}:${env.PORT}`,
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

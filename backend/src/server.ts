import 'dotenv/config';
import { buildApp } from './app.js';

const port = Number(process.env.PORT) || 3333;
const host = '0.0.0.0';

const app = buildApp();

const start = async () => {
  try {
    await app.listen({ port, host });
    app.log.info(`Servidor do PortalNutri rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

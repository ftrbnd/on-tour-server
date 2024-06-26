import app from './app.js';
import { registerDailyCronJob } from './lib/cron.js';
import { env } from './utils/env.js';

const host = env.RENDER ? '0.0.0.0' : 'localhost';
const port = env.PORT || 3000;

const start = async () => {
  try {
    registerDailyCronJob();

    const address = await app.listen({ host, port });

    console.log(`Server listening on ${address}`);
  } catch (e) {
    console.error(e);

    process.exit(1);
  }
};

start();

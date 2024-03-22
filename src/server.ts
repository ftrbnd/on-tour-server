import app from './app';
import { registerDailyCronJob } from './lib/cron';

const start = async () => {
  try {
    registerDailyCronJob();

    const address = await app.listen({ port: 3000 });

    console.log(`Server listening on ${address}`);
  } catch (e) {
    console.error(e);

    process.exit(1);
  }
};

start();

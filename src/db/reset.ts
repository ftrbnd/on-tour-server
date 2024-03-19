import { db } from './drizzle';
import { sessions, users } from './schema';

const main = async () => {
  try {
    await db.delete(sessions);
    await db.delete(users);

    console.log('Reset database');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();

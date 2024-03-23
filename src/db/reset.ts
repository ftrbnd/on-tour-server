import { db } from './drizzle';
import { accounts, sessions, users } from './schema';

const main = async () => {
  try {
    await db.delete(sessions);
    await db.delete(accounts);
    await db.delete(users);

    console.log('Successfully reset database');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

main();

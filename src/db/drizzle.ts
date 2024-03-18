import { NeonQueryFunction, neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '../utils/env';

// TODO:  https://github.com/neondatabase/serverless/issues/66
const sql: NeonQueryFunction<boolean, boolean> = neon(env.DRIZZLE_DATABASE_URL);
export const db = drizzle(sql);

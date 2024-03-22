import dotenv from 'dotenv';
dotenv.config();

import z from 'zod';

const envSchema = z.object({
  DRIZZLE_DATABASE_URL: z.string().url(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  SPOTIFY_REDIRECT_URI: z.string().url(),
  EXPO_REDIRECT_URL: z.string().url(),
  DAILY_CRON_HOUR: z.coerce.number(),
  DAILY_CRON_MINUTE: z.coerce.number()
});

export const env = envSchema.parse(process.env);

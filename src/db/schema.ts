import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  displayName: text('display_name'),
  avatar: text('avatar')
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date'
  }).notNull()
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  provider: text('provider').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {
    withTimezone: true,
    mode: 'date'
  }).notNull()
});

export const playlists = pgTable('playlists', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  setlistId: text('setlist_id').notNull(),
  title: text('title').notNull()
});

export const selectAccountSchema = createSelectSchema(accounts);
export type Account = z.infer<typeof selectAccountSchema>;

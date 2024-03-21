import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  spotifyId: text('spotify_id').unique().notNull(),
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
  }).notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull()
});

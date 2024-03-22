import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { buildJsonSchemas } from 'fastify-zod';
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

export const selectAccountSchema = createSelectSchema(accounts);
export type Account = z.infer<typeof selectAccountSchema>;

const getCurrentUserResponseSchema = z.object({
  session: z.object({
    id: z.string()
  }),
  user: z.object({
    displayName: z.string(),
    avatar: z.string()
  }),
  account: z.object({
    accessToken: z.string(),
    providerId: z.string()
  })
});

export const { schemas, $ref } = buildJsonSchemas({
  getCurrentUserResponseSchema
});

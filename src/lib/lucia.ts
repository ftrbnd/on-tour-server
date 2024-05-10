import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db/drizzle.js';
import { sessions, users } from '../db/schema.js';
import { Lucia } from 'lucia';
import { Spotify } from 'arctic';
import { env } from '../utils/env.js';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      displayName: attributes.displayName,
      avatar: attributes.avatar
    };
  }
});

export const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET, env.SPOTIFY_REDIRECT_URI);
export const scopes = ['user-follow-read', 'user-top-read', 'playlist-modify-public', 'playlist-modify-private', 'ugc-image-upload'];

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  displayName?: string | null;
  avatar?: string | null;
}

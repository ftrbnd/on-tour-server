import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db/drizzle';
import { sessions, users } from '../db/schema';
import { Lucia } from 'lucia';
import { Spotify } from 'arctic';
import { env } from '../utils/env';

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
      spotifyId: attributes.spotifyId,
      avatar: attributes.avatar,
      displayName: attributes.displayName
    };
  }
});

export const spotify = new Spotify(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET, env.SPOTIFY_REDIRECT_URI);

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  spotifyId: string;
  avatar: string;
  displayName?: string | null;
}

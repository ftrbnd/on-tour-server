import { OAuth2RequestError, generateState } from 'arctic';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { lucia, spotify } from '../lib/lucia';
import { parseCookies, serializeCookie } from 'oslo/cookie';
import { db } from '../db/drizzle';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';

interface SpotifyUser {
  display_name?: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  images: {
    url: string;
    height?: number;
    width?: number;
  }[];
  type: 'user';
  uri: `spotify:user:${SpotifyUser['id']}`;
  followers: { href: null; total: number };
}

interface IQuerystring {
  code: string;
  state: string;
}

export const authRoutes = async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/login/spotify', async (request, reply) => {
    const state = generateState();
    const url = await spotify.createAuthorizationURL(state);

    return reply
      .header(
        'set-cookie',
        serializeCookie('spotify_oauth_state', state, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 60 * 10,
          sameSite: 'lax'
        })
      )
      .redirect(url.toString());
  });

  fastify.get<{ Querystring: IQuerystring }>('/login/spotify/callback', async (request, reply) => {
    const code = request.query.code?.toString() ?? null;
    const state = request.query.state?.toString() ?? null;
    const storedState = parseCookies(request.headers.cookie ?? '').get('spotify_oauth_state') ?? null;

    if (!code || !state || !storedState || state !== storedState) {
      return reply.status(400).send('Failed to authenticate with Spotify');
    }

    try {
      const tokens = await spotify.validateAuthorizationCode(code);
      const spotifyUserResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });
      if (!spotifyUserResponse.ok) return reply.status(400).send();

      const spotifyUser: SpotifyUser = await spotifyUserResponse.json();
      const existingUser = await db.select().from(users).where(eq(users.spotifyId, spotifyUser.id));

      if (existingUser[0]) {
        const session = await lucia.createSession(existingUser[0].id, {});
        reply.header('set-cookie', lucia.createSessionCookie(session.id).serialize());
        return reply.redirect('/');
      }

      const userId = generateId(15);
      await db.insert(users).values({ id: userId, spotifyId: spotifyUser.id, displayName: spotifyUser.display_name });
      const session = await lucia.createSession(userId, {});
      reply.header('set-cookie', lucia.createSessionCookie(session.id).serialize());
      return reply.redirect('/');
    } catch (e) {
      if (e instanceof OAuth2RequestError) {
        return reply.status(400).send(e);
      }
      return reply.status(500).send(e);
    }
  });
};

import { OAuth2RequestError, generateState } from 'arctic';
import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { lucia, spotify } from '../lib/lucia';
import { parseCookies, serializeCookie } from 'oslo/cookie';
import { db } from '../db/drizzle';
import { eq } from 'drizzle-orm';
import { Session, User, generateId } from 'lucia';
import { users } from '../db/schema';

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

declare module 'fastify' {
  interface FastifyRequest {
    session: Session | null;
    user: User | null;
  }
}

export const validateRequest: preHandlerHookHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('VALIDATING REQUEST');

  const sessionId = lucia.readSessionCookie(request.headers.cookie ?? '');
  if (!sessionId) {
    console.log('no session id');

    request.session = null;
    request.user = null;
    return;
  }

  const { session, user } = await lucia.validateSession(sessionId);
  console.log('Session found', { session, user });

  if (session && session.fresh) {
    reply.header('set-cookie', lucia.createSessionCookie(session.id).serialize());
  }
  if (!session) {
    reply.header('set-cookie', lucia.createBlankSessionCookie().serialize());
  }

  request.session = session;
  request.user = user;
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('LOGGING IN');

  if (request.session) {
    console.log('Session found, redirecting');

    return reply.redirect('/');
  }

  const state = generateState();
  const url = await spotify.createAuthorizationURL(state);
  console.log({ url });

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
};

export const validateCallback = async (request: FastifyRequest<{ Querystring: IQuerystring }>, reply: FastifyReply) => {
  console.log('VALIDATING CALLBACK');

  const code = request.query.code?.toString() ?? null;
  const state = request.query.state?.toString() ?? null;
  const storedState = parseCookies(request.headers.cookie ?? '').get('spotify_oauth_state') ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    console.log('missing code state or storedState');

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

    console.log({ spotifyUser });

    if (existingUser[0]) {
      const session = await lucia.createSession(existingUser[0].id, {});
      reply.header('set-cookie', lucia.createSessionCookie(session.id).serialize());
      return reply.redirect('/');
    }

    const userId = generateId(15);
    await db.insert(users).values({
      id: userId,
      spotifyId: spotifyUser.id,
      displayName: spotifyUser.display_name
    });

    const session = await lucia.createSession(userId, {});
    return reply.header('set-cookie', lucia.createSessionCookie(session.id).serialize()).redirect('/');
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return reply.status(400).send(e);
    }
    return reply.status(500).send(e);
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('LOGGING OUT');

  if (!request.session) return reply.status(401).send();

  await lucia.invalidateSession(request.session.id);
  console.log('invalidated session!');

  return reply.header('set-cookie', lucia.createBlankSessionCookie().serialize()).redirect('/login/spotify');
};

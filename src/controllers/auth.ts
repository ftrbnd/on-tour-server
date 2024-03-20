import { OAuth2RequestError, generateState } from 'arctic';
import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { lucia, spotify } from '../lib/lucia';
import { parseCookies, serializeCookie } from 'oslo/cookie';
import { db } from '../db/drizzle';
import { eq } from 'drizzle-orm';
import { Session, User, generateId } from 'lucia';
import { users } from '../db/schema';
import { env } from '../utils/env';

// TODO: set up request + reply schemas

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
  const authHeader = request.headers.authorization;
  const sessionId = lucia.readBearerToken(authHeader ?? '');

  if (!sessionId) {
    request.session = null;
    request.user = null;
  } else {
    const { session, user } = await lucia.validateSession(sessionId);

    // TODO: refresh tokens?

    request.session = session;
    request.user = user;
  }
};

export const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.send({ user: request.user });
  } catch (e) {
    reply.status(500).send({ error: e });
  }
};

interface RefreshTokenRequest {
  refreshToken: string;
}

export const refreshTokens = async (request: FastifyRequest<{ Body: RefreshTokenRequest }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Cannot refresh tokens' });
  }

  try {
    const refreshToken = request.body.refreshToken;

    const tokens = await spotify.refreshAccessToken(refreshToken);

    reply.send({ ...tokens, sessionToken: request.session.id });
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return reply.status(400).send({ error: e });
    }
    reply.status(500).send({ error: e });
  }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  if (request.session) {
    return reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${request.session.id}`);
  }

  const state = generateState();
  const url = await spotify.createAuthorizationURL(state, { scopes: ['user-follow-read', 'user-top-read', 'playlist-modify-public', 'playlist-modify-private'] });

  reply
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
  const code = request.query.code?.toString() ?? null;
  const state = request.query.state?.toString() ?? null;
  const storedState = parseCookies(request.headers.cookie ?? '').get('spotify_oauth_state') ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return reply.status(400).send({ error: 'Missing or expired code' });
  }

  try {
    const tokens = await spotify.validateAuthorizationCode(code);
    const spotifyUserResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    if (!spotifyUserResponse.ok) throw new Error('Failed to get user details from Spotify');

    const spotifyUser: SpotifyUser = await spotifyUserResponse.json();
    const existingUser = await db.select().from(users).where(eq(users.spotifyId, spotifyUser.id));

    if (existingUser[0]) {
      const session = await lucia.createSession(existingUser[0].id, {});

      request.session = session;
      request.user = existingUser[0];

      return reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${session.id}&access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`);
    }

    const userId = generateId(15);
    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        spotifyId: spotifyUser.id,
        displayName: spotifyUser.display_name
      })
      .returning();

    const session = await lucia.createSession(userId, {});

    request.session = session;
    request.user = newUser[0];

    reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${session.id}&access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      reply.status(400).send({ error: e });
    }
    reply.status(500).send({ error: e });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Cannot log out' });
  }

  await lucia.invalidateSession(request.session.id);

  reply.status(204);
};

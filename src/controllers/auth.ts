import { OAuth2RequestError, generateState } from 'arctic';
import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { lucia, scopes, spotify } from '../lib/lucia.js';
import { parseCookies, serializeCookie } from 'oslo/cookie';
import { env } from '../utils/env.js';
import { createAccount, createUserFromSpotify, findAccountByProviderId, findAccountByUserId, getSpotifyUser, updateAccountTokensByUserId } from '../services/auth.js';

interface IQuerystring {
  code: string;
  state: string;
}

export const validateRequest: preHandlerHookHandler = async (request: FastifyRequest) => {
  const authHeader = request.headers.authorization;
  const sessionId = lucia.readBearerToken(authHeader ?? '');

  if (sessionId) {
    const { session, user } = await lucia.validateSession(sessionId);

    if (user) {
      request.user = user;

      const account = await findAccountByUserId(user.id);
      if (account) {
        const tokens = await spotify.refreshAccessToken(account.refreshToken);
        const updatedAccount = await updateAccountTokensByUserId(user.id, tokens);
        request.account = updatedAccount ?? null;
      }
    }

    request.session = session;
  } // else, request decorators are null by default
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  if (request.session) {
    return reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${request.session.id}`);
  }

  const state = generateState();
  const url = await spotify.createAuthorizationURL(state, {
    scopes
  });

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
    const spotifyUser = await getSpotifyUser(tokens.accessToken);
    const account = await findAccountByProviderId(spotifyUser.id);

    if (account) {
      await updateAccountTokensByUserId(account.userId, tokens);
      const session = await lucia.createSession(account.userId, {});

      return reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${session.id}`);
    }

    const newUser = await createUserFromSpotify(spotifyUser);
    await createAccount(newUser.id, spotifyUser.id, tokens);
    const session = await lucia.createSession(newUser.id, {});

    reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${session.id}`);
  } catch (e: any) {
    if (e instanceof OAuth2RequestError) {
      return reply.status(400).send({ error: e.message });
    }
    reply.status(500).send({ error: e.message });
  }
};

export const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.status(200).send({
      session: request.session,
      user: request.user,
      account: request.account
    });
  } catch (e: any) {
    reply.status(500).send({ error: e.message });
  }
};

export const getTokenWithClientCredentials = async (request: FastifyRequest, reply: FastifyReply) => {
  if (request.session) {
    return reply.status(401).send({ error: 'User already has session' });
  }

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });

    const data = await res.json();

    reply.status(200).send(data);
  } catch (e: any) {
    reply.status(500).send({ error: e.message });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Cannot log out' });
  }

  try {
    await lucia.invalidateSession(request.session.id);

    reply.status(204);
  } catch (e: any) {
    if (e instanceof OAuth2RequestError) {
      return reply.status(400).send({ error: e.message });
    }
    reply.status(500).send({ error: e.message });
  }
};

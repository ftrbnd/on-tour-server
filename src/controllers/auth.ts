import { OAuth2RequestError, generateState } from 'arctic';
import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { lucia, spotify } from '../lib/lucia';
import { parseCookies, serializeCookie } from 'oslo/cookie';
import { env } from '../utils/env';
import { createAccount, createUserFromSpotify, findAccountByProviderId, findAccountByUserId, getSpotifyUser, updateAccountTokensByUserId } from '../services/auth';

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
  if (request.session && request.account) {
    return reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${request.session.id}&access_token=${request.account.accessToken}`);
  }

  const state = generateState();
  const url = await spotify.createAuthorizationURL(state, {
    scopes: ['user-follow-read', 'user-top-read', 'playlist-modify-public', 'playlist-modify-private']
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

      return reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${session.id}&access_token=${tokens.accessToken}`);
    }

    const newUser = await createUserFromSpotify(spotifyUser);
    await createAccount(newUser.id, spotifyUser.id, tokens);
    const session = await lucia.createSession(newUser.id, {});

    reply.redirect(`${env.EXPO_REDIRECT_URL}?session_token=${session.id}&access_token=${tokens.accessToken}`);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      reply.status(400).send({ error: e });
    }
    reply.status(500).send({ error: e });
  }
};

export const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.status(200).send({
      session: request.session,
      user: request.user,
      account: request.account
    });
  } catch (e) {
    reply.status(500).send({ error: e });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Cannot log out' });
  }

  try {
    await lucia.invalidateSession(request.session.id);

    reply.status(204);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      reply.status(400).send({ error: e });
    }
    reply.status(500).send({ error: e });
  }
};

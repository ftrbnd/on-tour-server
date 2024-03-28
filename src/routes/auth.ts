import { z } from 'zod';
import { getCurrentUser, login, logout, validateCallback } from '../controllers/auth';
import { FastifyPluginAsyncZod } from '@benjaminlindberg/fastify-type-provider-zod';

// TODO: https://github.com/turkerdev/fastify-type-provider-zod/issues/75
export const authRoutes: FastifyPluginAsyncZod = async function (server) {
  server.get('/login/spotify', login);
  server.get(
    '/login/spotify/callback',
    {
      schema: {
        querystring: z.object({
          code: z.string(),
          state: z.string()
        }),
        headers: z.object({
          cookie: z.string()
        })
      }
    },
    validateCallback
  );
  server.get(
    '/me',
    {
      schema: {
        response: {
          200: z.object({
            session: z.object({
              id: z.string()
            }),
            user: z.object({
              displayName: z.string(),
              avatar: z.string(),
              id: z.string()
            }),
            account: z.object({
              accessToken: z.string(),
              providerId: z.string()
            })
          })
        },
        headers: z.object({
          authorization: z.string()
        })
      }
    },
    getCurrentUser
  );

  server.post(
    '/logout',
    {
      schema: {
        headers: z.object({
          authorization: z.string()
        })
      }
    },
    logout
  );
};

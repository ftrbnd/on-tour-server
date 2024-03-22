import { FastifyInstance } from 'fastify';
import { getCurrentUser, login, logout, validateCallback, validateRequest } from '../controllers/auth';
import { $ref } from '../db/schema';

export const authRoutes = async function (server: FastifyInstance) {
  server.decorateRequest('session', null);
  server.decorateRequest('user', null);
  server.decorateRequest('account', null);

  server.addHook('preHandler', validateRequest);

  server.get('/login/spotify', login);
  server.get('/login/spotify/callback', validateCallback);
  server.get(
    '/me',
    {
      schema: {
        response: {
          200: $ref('getCurrentUserResponseSchema')
        }
      }
    },
    getCurrentUser
  );

  server.post('/logout', logout);
};

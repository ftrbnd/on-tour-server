import { FastifyInstance } from 'fastify';
import { getCurrentUser, login, logout, validateCallback, validateRequest } from '../controllers/auth';

export const authRoutes = async function (fastify: FastifyInstance) {
  fastify.decorateRequest('session', null);
  fastify.decorateRequest('user', null);
  fastify.decorate('account', null);

  fastify.addHook('preHandler', validateRequest);

  fastify.get('/me', getCurrentUser);

  fastify.get('/login/spotify', login);

  fastify.get('/login/spotify/callback', validateCallback);

  fastify.post('/logout', logout);
};

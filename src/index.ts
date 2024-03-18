import Fastify from 'fastify';
import { authRoutes } from './routes/auth';

const fastify = Fastify({
  logger: true
});

fastify.register(authRoutes);
fastify.get('/', (req, reply) => {
  return reply.send({ hello: 'world' });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

import Fastify from 'fastify';
import { authRoutes } from './routes/auth';
import { Session, User } from 'lucia';
import { Account } from './db/schema';
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session | null;
    user: User | null;
    account: Account | null;
  }
}

const server = Fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.withTypeProvider<ZodTypeProvider>().register(authRoutes, {
  prefix: '/api/auth'
});
server.get('/healthcheck', async () => {
  return { status: 'OK' };
});

const start = async () => {
  try {
    const address = await server.listen({ port: 3000 });
    console.log(`Server listening on ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

// TODO: set up cron job to delete expired sessions
// await lucia.deleteExpiredSessions();

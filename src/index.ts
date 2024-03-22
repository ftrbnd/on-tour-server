import Fastify from 'fastify';
import { authRoutes } from './routes/auth';
import { Session, User } from 'lucia';
import { Account, schemas } from './db/schema';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session | null;
    user: User | null;
    account: Account | null;
  }
}

const server = Fastify();

for (const schema of schemas) {
  server.addSchema(schema);
}

server.register(authRoutes, { prefix: '/api/auth' });
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

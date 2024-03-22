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

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.withTypeProvider<ZodTypeProvider>().register(authRoutes, {
  prefix: '/api/auth'
});
app.get('/healthcheck', async () => {
  return { status: 'OK' };
});

export default app;

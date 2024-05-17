import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { Session, User } from 'lucia';
import { Account } from './db/schema.js';
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { validateRequest } from './controllers/auth.js';
import { userRoutes } from './routes/users.js';
import { createReadStream } from 'fs';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session | null;
    user: User | null;
    account: Account | null;
  }
}

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.decorateRequest('session', null);
app.decorateRequest('user', null);
app.decorateRequest('account', null);

app.addHook('preHandler', validateRequest);

app.withTypeProvider<ZodTypeProvider>().register(authRoutes, {
  prefix: '/api/auth'
});
app.withTypeProvider<ZodTypeProvider>().register(userRoutes, {
  prefix: '/api/users'
});
app.get('/healthcheck', async () => {
  return { status: 'OK' };
});
app.get('/privacy', (_request, reply) => {
  const stream = createReadStream('./src/pages/privacy-policy.html');
  reply.type('text/html').send(stream);
});

export default app;

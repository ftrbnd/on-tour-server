import Fastify from 'fastify';
import FastifyFavicon from 'fastify-favicon';
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import FastifyStatic from '@fastify/static';
import path from 'path';

import { validateRequest } from './controllers/auth.js';
import { Account } from './db/schema.js';
import { Session, User } from 'lucia';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session | null;
    user: User | null;
    account: Account | null;
  }
}

const dirname = import.meta.dirname;
const app = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
});

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

app.get('/healthcheck', { logLevel: 'silent' }, async () => {
  return { status: 'OK' };
});

app.register(FastifyStatic, {
  root: path.join(dirname, '../pages')
});
app.register(FastifyFavicon, {
  path: './pages',
  name: 'favicon.ico'
});

app.get('/', (_request, reply) => {
  reply.sendFile('index.html');
});
app.get('/privacy', (_request, reply) => {
  reply.sendFile('privacy-policy.html');
});

export default app;

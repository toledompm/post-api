import Fastify, { FastifyInstance } from 'fastify';
import { postModule } from '@posts/postModule';
import { appConfig } from '@common/config';
import Ajv from 'ajv';
import Etag from '@fastify/etag';
import cors from '@fastify/cors';

const registerRoutes = async (instance: FastifyInstance) => {
  const promises = [
    postModule.routes,
  ].map(async (route) => {
    await instance.register(route);
  });

  await Promise.all(promises);
};

const start = async () => {
  const { server: serverConfig } = appConfig();
  const fastify = Fastify({
    logger: true,
  });

  const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: 'array',
    allErrors: true,
  });

  try {
    fastify.setValidatorCompiler(({ schema }) => {
      return ajv.compile(schema);
    });

    await fastify.register(Etag);

    await fastify.register(cors, {
      origin: '*',
    });

    await registerRoutes(fastify);
    await fastify.listen({ host: serverConfig.host, port: serverConfig.port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();

import { appConfig } from '@common/config';
import cors from '@fastify/cors';
import Etag from '@fastify/etag';
import { postModule } from '@posts/postModule';
import { rssModule } from '@rss/rssModule';
import Ajv from 'ajv';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';

const registerRoutes = async (instance: FastifyInstance) => {
  const promises = [
    () => postModule.routes(postModule.exports.postService, '/api/posts'),
    () => rssModule.routes(rssModule.exports.rssService, '/rss'),
  ].map(async (route) => {
    await instance.register(route());
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

import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Env from '@fastify/env';
import Cors from '@fastify/cors';
import Sensible from '@fastify/sensible';
import AutoLoad from '@fastify/autoload';
import { resolve } from 'path';
import S from 'fluent-json-schema';

const app: FastifyPluginAsync = async (fastify, options) => {
  await fastify.register(Env, {
    schema: S.object()
      .prop('NODE_ENV', S.string().required())
      .prop('PORT', S.number())
      .prop('SECRET', S.string().required())
      .prop('MYSQL_HOST', S.string().required())
      .prop('MYSQL_PORT', S.number().required())
      .prop('MYSQL_USERNAME', S.string().required())
      .prop('MYSQL_PASSWORD', S.string().required())
      .prop('MYSQL_DATABASE', S.string().required())
      .prop('PORTAL_LOGIN', S.string().required())
      .prop('PORTAL_PASSWORD', S.string().required())
      .valueOf(),
    dotenv: true,
  });

  await fastify.register(Cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
  await fastify.register(Sensible);

  await fastify.register(AutoLoad, {
    dir: resolve('dist/plugins'),
    options,
  });

  await fastify.register(AutoLoad, {
    dir: resolve('dist/routes'),
    dirNameRoutePrefix: false,
    options,
  });
};

export default fp(app);

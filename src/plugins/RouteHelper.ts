import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Colors } from '../lib/Colors';

const routeHelper: FastifyPluginAsync = async (fastify) => {
  const logger = fastify.log.child({ name: 'Route' });

  const methodColor = (method: string) => {
    switch (method) {
      case 'POST':
        return Colors.FgMagenta;
      case 'GET':
        return Colors.FgCyan;
      default:
        return '';
    }
  };

  fastify.addHook('onRoute', (route) => {
    if (route.method === 'HEAD') return;
    const isPrivate = false; // TODO Authorization access
    const method = methodColor(route.method.toString()) + route.method;
    logger.info(`${method} ${(isPrivate ? Colors.FgRed : Colors.FgGreen) + route.url}`);
  });
};

export default fp(routeHelper);

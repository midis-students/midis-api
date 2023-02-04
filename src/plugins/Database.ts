import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { BaseEntity, DataSource, EntitySchema } from 'typeorm';
import fs from 'fs';
import path from 'path';
import { Colors } from '../lib/Colors';

const DatabasePlugin: FastifyPluginAsync = async (fastify) => {
  const logger = fastify.log.child({ name: 'Database' });

  type EntityClass = { new (): EntitySchema };
  type ImportModule = Record<string, EntityClass>;

  const entities: EntityClass[] = [];

  const entityPath = path.resolve('dist/entity');
  const files = fs
    .readdirSync(entityPath)
    .filter((file) => file.endsWith('.js'))
    .map((file) => path.join(entityPath, file));

  for (const file of files) {
    const module: ImportModule = await import(file);
    Object.values(module).forEach((entity) => {
      if (entity.prototype instanceof BaseEntity) {
        entities.push(entity);
        logger.info(`Entity ${Colors.FgYellow + entity.name + Colors.FgCyan} loaded`);
      }
    });
  }

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    synchronize: true,
    logging: false,
    entities,
  });

  await dataSource.initialize();
  if (dataSource.isInitialized) {
    logger.info('MySQL connected');
  } else {
    throw Error(`Can't connect to MySQL server`);
  }
};

export default fp(DatabasePlugin);

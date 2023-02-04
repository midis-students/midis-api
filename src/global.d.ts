import { FastifyReply, FastifyRequest } from 'fastify';

export {};

declare module 'fastify' {
  interface FastifyInstance {
    config: NodeJS.ProcessEnv;
  }
}

declare global {
  type FastifyAsyncHandler = (req: FastifyRequest, res: FastifyReply) => Promise<void>;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: number;
      SECRET: string;
      MYSQL_HOST: string;
      MYSQL_PORT: number;
      MYSQL_USERNAME: string;
      MYSQL_PASSWORD: string;
      MYSQL_DATABASE: string;
      PORTAL_LOGIN: string;
      PORTAL_PASSWORD: string;
    }
  }
}

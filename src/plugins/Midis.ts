import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Client } from "../lib/midis";

declare module "fastify" {
  interface FastifyInstance {
    getMidis: () => Promise<Client>;
  }
}

const MidisPlugin: FastifyPluginAsync = async (fastify) => {
  let current: Client = null;

  const getMidis = async () => {
    if (!current || !current?.isActive()) {
      current = await Client.Login(
        process.env.PORTAL_LOGIN,
        process.env.PORTAL_PASSWORD
      );
    }

    return current;
  };

  fastify.decorate("getMidis", getMidis);
};

export default fp(MidisPlugin);

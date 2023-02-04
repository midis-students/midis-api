import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    cache: CacheManager;
  }
}

type CacheItem = {
  ttl: number;
  time: number;
  value: unknown;
};

class CacheManager {
  private data = new Map<string, CacheItem>();

  public get<T>(key: string): T | undefined {
    const item = this.data.get(key);
    if (!item) return;

    if (Date.now() - item.time <= item.ttl) {
      return item.value as T;
    }
    this.data.delete(key);

    return;
  }

  public set(key: string, value: unknown, ttl = -1) {
    this.data.set(key, {
      value,
      ttl,
      time: Date.now(),
    });
  }
}

const CachePlugin: FastifyPluginAsync = async (fastify) => {
  const cache = new CacheManager();

  fastify.decorate("cache", cache);
};

export default fp(CachePlugin);

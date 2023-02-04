import Fastify from "fastify";
import App from "./app";

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname,reqId,res",
        },
      },
    },
    disableRequestLogging: true,
  });

  await fastify.register(App);

  const port = Number(process.env.PORT) || 4000;
  const host = "0.0.0.0";

  fastify.listen({ port, host }, (err) => {
    if (err) throw err;
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

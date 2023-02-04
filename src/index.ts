import Fastify from 'fastify';
import App from './app';

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname,reqId,res',
        },
      },
    },
    disableRequestLogging: true,
  });

  await fastify.register(App);

  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0';

  fastify.listen({ port, host }, (err) => {
    if (err) throw err;
  });

  return;

  const schedule: Record<string, { data: object; time: number }> = {};

  const setSchedule = (group: string, data: object) => {
    if (!(group in schedule)) {
      schedule[group] = {
        data: {},
        time: 0,
      };
    }
    schedule[group].data = data;
    schedule[group].time = Date.now();
  };

  const getSchedule = (group: string) => {
    const cache = schedule[group];
    if (cache && Date.now() - cache.time <= SCHEDULE_EXPIRED) {
      return cache.data;
    }
    return null;
  };

  type AppGetDTO = {
    Querystring: {
      group: string;
    };
  };

  app.get<AppGetDTO>('/', async (req, res) => {
    const group = req.query.group || 'П-38';

    const cache = getSchedule(group);
    if (cache) {
      console.log('Return from cache');
      return cache;
    }

    let client: Client;
    const SESSION_EXPIRED = 1000 * 5 * 60;

    if (fs.existsSync(sessionFile)) {
      const session = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
      if (Date.now() - session.time <= SESSION_EXPIRED) {
        client = new Client(session);
        console.log('Load session from file');
      }
    }

    if (!client) {
      client = await Client.Login(settings.login, settings.password);
      fs.writeFileSync(sessionFile, JSON.stringify(client['session'], null, 2));
      console.log('Login to portal');
    }

    const schedule = await client.getSchedule(group);
    setSchedule(group, schedule);

    return schedule;
  });

  app.listen(
    {
      port: 4000,
      host: '0.0.0.0',
    },
    (err) => {
      if (err) throw err;
      console.log('Server started');
    },
  );
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

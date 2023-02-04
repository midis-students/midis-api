import { FastifyPluginAsync } from "fastify";
import { ScheduleResponse } from "../lib/midis/types";

export const autoPrefix = "/schedule";

const ScheduleRoute: FastifyPluginAsync = async (fastify) => {
  const SCHEDULE_EXPIRED = 1000 * 60 * 60;
  const { cache, getMidis } = fastify;

  const getCacheGroup = (group: string) =>
    cache.get<ScheduleResponse>(`group-${group}`);
  const setCacheGroup = (group: string, value: ScheduleResponse) =>
    cache.set(`group-${group}`, value, SCHEDULE_EXPIRED);

  type GetScheduleDTO = {
    Querystring: {
      group?: string;
    };
  };

  fastify.get<GetScheduleDTO>("/", async (req, res) => {
    const group = req.query.group;
    const cache = getCacheGroup(group);
    if (cache) {
      return cache;
    }

    const midis = await getMidis();

    const schedule = await midis.getSchedule(group);
    if (schedule) {
      setCacheGroup(group, schedule);
      return schedule;
    }

    throw fastify.httpErrors.notFound("Group not exist");
  });
};

export default ScheduleRoute;

import { ConnectionOptions } from 'bullmq';
import config from '.';

export const redisConfig: ConnectionOptions = {
    url: config.redis.url
}


import { ConnectionOptions } from 'bullmq';
import dotenv from 'dotenv';
import path from 'path';
import config from '.';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const redisConfig: ConnectionOptions = {
    url: config.redis.url
}


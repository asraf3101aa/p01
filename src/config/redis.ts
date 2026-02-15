import Redis from 'ioredis';
import config from './index';

const redis = new Redis(config.redis.url);

export default redis;

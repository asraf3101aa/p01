import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import config from '../config';
import redisClient from '../config/redis';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skipSuccessfulRequests: true,
    store: new RedisStore({
        // @ts-ignore
        sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
    handler: (_, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
        });
    },
});

export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    store: new RedisStore({
        // @ts-ignore
        sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
    handler: (_, res) => {
        res.set('Retry-After', Math.ceil(config.rateLimit.windowMs / 1000).toString());
        res.status(429).json({
            status: 'error',
            message: 'Too many requests from this IP, please try again later',
        });
    },
});

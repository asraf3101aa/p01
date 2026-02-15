import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.config';

export const emailQueue = new Queue('emails', {
    connection: redisConfig,
});

export const addEmailJob = async (data: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}) => {
    return emailQueue.add('send-email', data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};

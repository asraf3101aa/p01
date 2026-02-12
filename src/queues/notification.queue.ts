import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.config';

export const notificationQueue = new Queue('notifications', {
    connection: redisConfig,
});

export const addNotificationJob = async (data: {
    userId: number;
    title: string;
    message: string;
    type: string;
}) => {
    return notificationQueue.add('send-notification', data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};

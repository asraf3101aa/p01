import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis.config';
import { notificationService, userService, emailService } from '../services';
import logger from '../config/logger';

export const notificationWorker = new Worker(
    'notifications',
    async (job: Job) => {
        const { userId, title, message, type } = job.data;

        logger.info(`Processing notification job ${job.id} for user ${userId}`);

        const { prefs } = await notificationService.getPreferences(userId);
        if (!prefs) return;

        // 1. In-App Notification
        if (prefs.inAppEnabled) {
            await notificationService.createInAppNotification(userId, title, message, type);
        }

        // 2. Email Notification
        if (prefs.emailEnabled) {
            const { user } = await userService.getUserById(userId);
            if (user && user.email) {
                await emailService.sendEmail(user.email, title, message);
            }
        }

        // 3. SMS Notification (Mock)
        if (prefs.smsEnabled) {
            logger.info(`Mock SMS sent to user ${userId}: ${title}`);
        }
    },
    { connection: redisConfig }
);

notificationWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed with error: ${err.message}`);
});

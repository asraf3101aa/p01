import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis.config';
import { emailService } from '../services';
import logger from '../config/logger';

export const emailWorker = new Worker(
    'emails',
    async (job: Job) => {
        const { to, subject, text, html } = job.data;
        logger.info(`Processing email job ${job.id} for ${to}`);
        await emailService.sendEmailDirect(to, subject, text, html);
    },
    { connection: redisConfig }
);

emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed with error: ${err.message}`);
});

import { Server } from 'http';
import app from './app';
import config from './config';
import logger from './config/logger';
import { seedRBAC } from './services/rbac.service';

import { notificationWorker } from './workers/notification.worker';
import { emailWorker } from './workers/email.worker';

let server: Server;

const startServer = async () => {
    try {
        await seedRBAC();
        logger.info('RBAC seeds synchronized');

        server = app.listen(config.port, () => {
            logger.info(`Listening to port ${config.port}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

const exitHandler = async () => {
    if (notificationWorker) {
        await notificationWorker.close();
    }
    if (emailWorker) {
        await emailWorker.close();
    }
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};


const unexpectedErrorHandler = (error: Error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});

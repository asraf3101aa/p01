import nodemailer from 'nodemailer';
import logger from '../config/logger';
import config from '../config';

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        await transporter.sendMail({
            from: config.smtp.from,
            to,
            subject,
            text,
        });
        logger.info(`Email sent to ${to}`);
    } catch (error) {
        logger.error(`Error sending email to ${to}:`, error);
        throw error;
    }
};

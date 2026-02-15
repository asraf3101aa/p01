import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import logger from '../config/logger';
import { addEmailJob } from '../queues/email.queue';

let transport: Transporter;

if (config.env === 'development') {
    transport = nodemailer.createTransport({
        jsonTransport: true,
    });
    logger.info('Email transport: Console (development mode)');
} else {
    transport = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });

    transport
        .verify()
        .then(() => logger.info('Connected to SMTP server'))
        .catch((err) =>
            logger.warn(
                'Unable to connect to SMTP server. Check your credentials.',
                err,
            ),
        );
}

export const sendEmailDirect = async (
    to: string,
    subject: string,
    text: string,
    html?: string,
) => {
    const msg = { from: config.smtp.from, to, subject, text, html };

    const info = await transport.sendMail(msg);

    if (config.env === 'development') {
        console.log('--- Nodemailer Raw Message ---');
        console.log(info.message.toString());
        console.log('-------------------------------');
    } else {
        logger.info(`Email sent to ${to} (Message ID: ${info.messageId})`);
    }
};

export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string,
) => {
    await addEmailJob({ to, subject, text, ...(html && { html }) });
};

export const sendVerificationEmail = async (to: string, token: string) => {
    const subject = 'Email Verification';
    const verificationUrl = `${config.frontendUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const text = `Dear user,
To verify your email, click on this link: ${verificationUrl}
If you did not create an account, please ignore this email.`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    .button {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h2>Email Verification</h2>
  <p>Dear user,</p>
  <p>Please click the button below to verify your email address and activate your account:</p>
  <a href="${verificationUrl}" class="button">Verify Email</a>
  <p>If the button doesn't work, copy-paste this link in your browser:</p>
 <a href="${verificationUrl}">Verify Email</a>
  <p>If you did not create an account, please ignore this email.</p>
</body>
</html>`;

    await sendEmail(to, subject, text, html);
};
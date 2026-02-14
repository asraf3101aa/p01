import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['production', 'development', 'staging']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().default('file:local.db'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    JWT_ACCESS_TOKEN_SECRET: z.string().default('thisisasecretaccesstoken'),
    JWT_REFRESH_TOKEN_SECRET: z.string().default('thisisarefreshtokensecret'),
    JWT_ACCESS_TOKEN_LIFETIME_IN_MINUTES: z.coerce.number().default(30),
    JWT_REFRESH_TOKEN_LIFETIME_IN_DAYS: z.coerce.number().default(30),
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    SMTP_FROM: z.string().default(''),
    JWT_ISSUER: z.string().default('pulse'),
    JWT_AUDIENCE: z.string().default('pulse'),
});

const envVars = envSchema.parse(process.env);

export default {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    db: {
        url: envVars.DATABASE_URL,
    },
    redis: {
        url: envVars.REDIS_URL,
    },
    jwt: {
        accessTokenSecret: envVars.JWT_ACCESS_TOKEN_SECRET,
        refreshTokenSecret: envVars.JWT_REFRESH_TOKEN_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_TOKEN_LIFETIME_IN_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_TOKEN_LIFETIME_IN_DAYS,
        issuer: envVars.JWT_ISSUER,
        audience: envVars.JWT_AUDIENCE,
    },
    smtp: {
        host: envVars.SMTP_HOST,
        port: envVars.SMTP_PORT,
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
        from: envVars.SMTP_FROM,
    },
};

import jwt from 'jsonwebtoken';
import config from '../config';
import { serviceError } from '../utils/serviceError';

export const generateToken = (sub: string | number, expiresMinutes: number, secret: string): string => {
    const payload = {
        sub,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),
    };
    return jwt.sign(payload, secret);
};

export const verifyToken = async (token: string, secret: string) => {
    try {
        const payload = jwt.verify(token, secret) as { sub: string };
        return { payload, message: 'Token verified successfully' };
    } catch (error: any) {
        return { payload: null, ...serviceError(error, 'Token verification failed') };
    }
};

export const generateAuthTokens = async (userId: number) => {
    try {
        const accessToken = generateToken(
            userId,
            config.jwt.accessExpirationMinutes,
            config.jwt.accessTokenSecret
        );

        const refreshToken = generateToken(
            userId,
            config.jwt.refreshExpirationDays * 24 * 60,
            config.jwt.refreshTokenSecret
        );

        return {
            tokens: {
                accessToken,
                refreshToken
            },
            message: 'Tokens generated successfully',
        };
    } catch (error: any) {
        return { tokens: null, ...serviceError(error, 'Token generation failed') };
    }
};

export const generateVerificationToken = async (email: string) => {
    try {
        const expiresMinutes = 60;
        const token = generateToken(email, expiresMinutes, config.jwt.accessTokenSecret);
        return { token, message: 'Verification token generated successfully' };
    } catch (error: any) {
        return { token: null, ...serviceError(error, 'Failed to generate verification token') };
    }
};

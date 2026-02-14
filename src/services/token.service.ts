import jwt from 'jsonwebtoken';
import config from '../config';

export const generateToken = (userId: number, expiresMinutes: number, secret: string): string => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),

    };
    return jwt.sign(payload, secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
    });
};

export const verifyToken = async (token: string, secret: string) => {
    const payload = jwt.verify(token, secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
    });

    return payload;
};

export const generateAuthTokens = async (userId: number) => {
    const accessToken = generateToken(userId, config.jwt.accessExpirationMinutes, config.jwt.accessTokenSecret);

    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + config.jwt.refreshExpirationDays);
    const refreshToken = generateToken(userId, config.jwt.refreshExpirationDays * 24 * 60, config.jwt.refreshTokenSecret);

    return {
        accessToken,
        refreshToken,
    };
};

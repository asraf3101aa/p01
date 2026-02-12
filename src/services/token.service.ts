import jwt from 'jsonwebtoken';
import config from '../config';

export const generateToken = (userId: number, expiresMinutes: number, secret = config.jwt.secret): string => {
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

export const generateAuthTokens = async (userId: number) => {
    const accessToken = generateToken(userId, config.jwt.accessExpirationMinutes);
    return {
        accessToken,
    };
};

import jwt from 'jsonwebtoken';
import config from '../config/config';

/**
 * Generate token
 * @param {number} userId
 * @param {number} expiresMinutes
 * @param {string} secret
 * @returns {string}
 */
export const generateToken = (userId: number, expiresMinutes: number, secret = config.jwt.secret): string => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (expiresMinutes * 60),
    };
    return jwt.sign(payload, secret);
};

/**
 * Generate auth tokens
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export const generateAuthTokens = async (userId: number) => {
    const accessToken = generateToken(userId, config.jwt.accessExpirationMinutes);
    return {
        access: {
            token: accessToken,
            expires: new Date(Date.now() + config.jwt.accessExpirationMinutes * 60 * 1000),
        },
    };
};

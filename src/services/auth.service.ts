import { userService, tokenService } from ".";
import config from "../config";
import { User } from "../models/user.model";
import bcrypt from 'bcrypt';
import { serviceError } from '../utils/serviceError';

export const loginUserWithEmailOrUsernameAndPassword = async (
    identifier: string,
    password: string
): Promise<{ user: User | null; message: string }> => {
    try {
        const { user } = await userService.getUserByIdentifier(identifier);

        if (!user) {
            await bcrypt.hash(password, 10);
            return { user: null, message: 'User not found' };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { user: null, message: 'Invalid password' };
        }

        return { user, message: 'Login successful' };
    } catch (error: any) {
        return { user: null, ...serviceError(error, 'Login failed') };
    }
};

export const refreshAuth = async (refreshToken: string) => {
    try {
        const { payload, message } = await tokenService.verifyToken(refreshToken, config.jwt.refreshTokenSecret);
        if (!payload) {
            return { tokens: null, message };
        }
        const userId = Number(payload.sub);
        const { user, message: userMessage } = await userService.getUserById(userId);
        if (!user) {
            return { tokens: null, message: userMessage };
        }
        const { tokens, message: tokenMessage } = await tokenService.generateAuthTokens(user.id);
        if (!tokens) {
            return { tokens: null, message: tokenMessage };
        }
        return { tokens, message: tokenMessage };
    } catch (error: any) {
        return { tokens: null, ...serviceError(error, 'Failed to generate auth tokens') };
    }
};
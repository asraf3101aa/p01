import { userService, tokenService } from ".";
import config from "../config";
import { User } from "../models/user.model";
import bcrypt from 'bcrypt';

export const loginUserWithEmailOrUsernameAndPassword = async (
    identifier: string,
    password: string
): Promise<User | null> => {
    const user = await userService.getUserByIdentifier(identifier);

    if (!user) {
        await bcrypt.hash(password, 10);
        return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return null;
    }

    return user;
};

export const refreshAuth = async (refreshToken: string) => {
    try {
        const payload = await tokenService.verifyToken(refreshToken, config.jwt.refreshTokenSecret);
        const userId = Number(payload.sub);
        const user = await userService.getUserById(userId);
        if (!user) {
            return null;
        }
        return tokenService.generateAuthTokens(userId);
    } catch (error) {
        return null;
    }
};
import { userService } from ".";
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
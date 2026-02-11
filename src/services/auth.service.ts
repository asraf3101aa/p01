import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { userService } from '.';

export const loginUserWithEmailOrUsernameAndPassword = async (identifier: string, password: string): Promise<User> => {
    const user = await userService.getUserByIdentifier(identifier);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Incorrect email/username or password');
    }
    return user;
};

import { z } from 'zod';

export const register = {
    body: z.object({
        username: z.string("Username is required").min(3, "Username must be at least 3 characters"),
        email: z.email("Please provide a valid email"),
        password: z.string("Password is required").min(8, "Password must be at least 8 characters"),
        firstName: z.string("First name is required"),
        lastName: z.string().optional(),
        phoneNumber: z.string().optional(),
    }),
};

export const login = {
    body: z.object({
        identifier: z.string("Username or Email is required"),
        password: z.string("Password is required"),
    }),
};

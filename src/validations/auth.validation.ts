import { z } from 'zod';

export const register = {
    body: z.object({
        username: z.string().min(3),
        email: z.email(),
        password: z.string().min(8),
        firstName: z.string(),
        lastName: z.string().optional(),
        phoneNumber: z.string().optional(),
    }),
};

export const login = {
    body: z.object({
        identifier: z.string(),
        password: z.string(),
    }),
};

import { z } from 'zod';
import { db } from '../db';

export const register = {
    body: z.object({
        username: z
            .string("Username is required")
            .min(3, "Username must be at least 3 characters")
            .refine(async (value) => {
                const existing = await db.query.users.findFirst({
                    where: (fields, { eq }) => eq(fields.username, value),
                });
                return !existing;
            }, { message: "Username already taken" }),

        email: z
            .email("Please provide a valid email")
            .refine(async (value) => {
                const existing = await db.query.users.findFirst({
                    where: (fields, { eq }) => eq(fields.email, value),
                });
                return !existing;
            }, { message: "Email already registered" }),

        password: z.string("Password is required").min(8, "Password must be at least 8 characters"),
        firstName: z.string("First name is required"),
        lastName: z.string().optional(),
        phoneNumber: z
            .string()
            .optional()
            .refine(async (value) => {
                if (!value) return true;
                const existing = await db.query.users.findFirst({
                    where: (fields, { eq }) => eq(fields.phoneNumber, value),
                });
                return !existing;
            }, { message: "Phone number already registered" }),
    }),
};

export const login = {
    body: z.object({
        identifier: z.string("Username or Email is required"),
        password: z.string("Password is required"),
    }),
};

export const refreshTokens = {
    body: z.object({
        refreshToken: z.string("Refresh token is required"),
    }),
};

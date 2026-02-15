import { z } from 'zod';
import { db } from '../db';

const RESERVED_USERNAMES = new Set([
    'admin', 'administrator', 'moderator', 'mod',
    'root', 'system', 'api', 'support', 'help',
    'null', 'undefined', 'settings', 'profile'
]);

export const register = {
    body: z.object({
        username: z
            .string("Username is required")
            .superRefine(async (value, ctx) => {
                if (value.length < 3) {
                    ctx.addIssue({
                        code: "too_small",
                        minimum: 3,
                        type: "string",
                        inclusive: true,
                        origin: "string",
                        message: "Username must be at least 3 characters",
                    });
                }

                if (value.length > 20) {
                    ctx.addIssue({
                        code: "too_big",
                        maximum: 20,
                        type: "string",
                        inclusive: true,
                        origin: "string",
                        message: "Username must be at most 20 characters",
                    });
                }

                if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Username can only contain letters, numbers, and underscores",
                    });
                }

                if (!/^[a-zA-Z]/.test(value)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Username must start with a letter",
                    });
                }

                if (!/[a-zA-Z0-9]$/.test(value)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Username must end with a letter or number",
                    });
                }

                if (value.includes('__')) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Username cannot contain consecutive underscores",
                    });
                }

                // Reserved username check
                if (RESERVED_USERNAMES.has(value.toLowerCase())) {
                    ctx.addIssue({
                        code: "custom",
                        message: "This username is reserved",
                    });
                }

                const existing = await db.query.users.findFirst({
                    where: (fields, { eq, and }) => and(
                        eq(fields.username, value),
                        eq(fields.isDeleted, false)
                    ),
                    columns: { username: true }
                });

                if (existing) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Username already taken",
                    });
                }
            }),

        email: z
            .email("Please provide a valid email")
            .toLowerCase()
            .refine(async (value) => {
                const existing = await db.query.users.findFirst({
                    where: (fields, { eq, and }) => and(
                        eq(fields.email, value),
                        eq(fields.isDeleted, false)
                    ),
                    columns: { email: true }
                });
                return !existing;
            }, { message: "Email already registered" }),

        password: z
            .string("Password is required")
            .superRefine((value, ctx) => {
                if (value.length < 8) {
                    ctx.addIssue({
                        code: "too_small",
                        minimum: 8,
                        type: "string",
                        inclusive: true,
                        origin: "string",
                        message: "Password must be at least 8 characters",
                    });
                }

                if (value.length > 128) {
                    ctx.addIssue({
                        code: "too_big",
                        maximum: 128,
                        type: "string",
                        inclusive: true,
                        origin: "string",
                        message: "Password is too long",
                    });
                }

                if (!/[a-z]/.test(value)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Password must contain at least one lowercase letter",
                    });
                }

                if (!/[A-Z]/.test(value)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Password must contain at least one uppercase letter",
                    });
                }

                if (!/\d/.test(value)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Password must contain at least one number",
                    });
                }
            }),

        name: z
            .string("Name is required")
            .superRefine((value, ctx) => {
                if (value.length < 2) {
                    ctx.addIssue({
                        code: "too_small",
                        minimum: 2,
                        type: "string",
                        inclusive: true,
                        origin: "string",
                        message: "Name must be at least 2 characters",
                    });
                }

                if (value.length > 100) {
                    ctx.addIssue({
                        code: "too_big",
                        maximum: 100,
                        type: "string",
                        inclusive: true,
                        origin: "string",
                        message: "Name must be at most 100 characters",
                    });
                }

                if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Name can only contain letters, spaces, hyphens, and apostrophes",
                    });
                }

                if (/^[a-zA-Z]/.test(value) === false) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Name must start with a letter",
                    });
                }

                if (/[a-zA-Z]$/.test(value) === false) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Name must end with a letter",
                    });
                }

                if (value.includes('  ')) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Name cannot contain consecutive spaces",
                    });
                }
            })
            .transform((value) => {
                return value
                    .trim()
                    .split(/\s+/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            }),

        avatar: z
            .string()
            .optional(),
        bio: z
            .string()
            .max(200, "Bio must be at most 200 characters")
            .optional()
    }),
};

export const login = {
    body: z.object({
        identifier: z
            .string()
            .min(1, "Username or Email is required"),

        password: z
            .string()
            .min(1, "Password is required"),
    }),
};

export const refreshTokens = {
    body: z.object({
        refreshToken: z.string("Refresh token is required"),
    }),
};

export const verifyEmail = {
    query: z.object({
        token: z.string("Token is required"),
    }),
};

export const resendVerificationEmail = {
    body: z.object({
        email: z.email("Invalid email"),
    }),
};

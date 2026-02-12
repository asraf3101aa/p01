import { z } from 'zod';

export const createThread = {
    body: z.object({
        title: z.string().min(1, 'Title is required').max(255),
        description: z.string().optional(),
    }),
};

export const createComment = {
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid thread ID'),
    }),
    body: z.object({
        content: z.string().min(1, 'Content is required'),
    }),
};

export const getThread = {
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid thread ID'),
    }),
};

export const subscribe = {
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid thread ID'),
    }),
};

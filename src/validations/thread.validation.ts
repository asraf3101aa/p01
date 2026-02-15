import { z } from 'zod';

export const createThread = {
    body: z.object({
        title: z.string('Title is required').min(5, 'Title must be at least 5 characters').max(255),
        content: z.string().optional(),
        imagePaths: z.array(z.string().max(500, "Image path too long")).optional(),
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
export const getThreads = {
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
    }),
};

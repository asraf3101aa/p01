import { z } from 'zod';

export const createThread = {
    body: z.object({
        content: z.string('Content is required'),
        imagePaths: z.array(z.string().max(500, "Image path too long")).optional(),
    }),
};

export const createComment = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
    }),
    body: z.object({
        content: z.string('Content is required'),
    }),
};

export const getThread = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
    }),
};

export const deleteThread = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
    }),
};

export const subscribe = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
    }),
};
export const getThreads = {
    query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
    }),
};

export const getUserThreads = {
    params: z.object({
        userId: z.coerce.number('Invalid user ID'),
    }),
    query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
    }),
};

export const updateThread = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
    }),
    body: z.object({
        content: z.string('Content is required'),
    }),
};

export const updateComment = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
        commentId: z.coerce.number('Invalid comment ID'),
    }),
    body: z.object({
        content: z.string('Content is required'),
    }),
};

export const deleteComment = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
        commentId: z.coerce.number('Invalid comment ID'),
    }),
};

export const getThreadComments = {
    params: z.object({
        id: z.coerce.number('Invalid thread ID'),
    }),
    query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
    }),
};

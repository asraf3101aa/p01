import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { threadService } from '../services';
import ApiResponse from '../utils/ApiResponse';

export const createThread = catchAsync(async (req: Request, res: Response) => {
    const thread = await threadService.createThread({
        ...req.body,
        authorId: req.user.id,
    });
    ApiResponse.created(res, thread, 'Thread created successfully');
});

export const getThreads = catchAsync(async (_req: Request, res: Response) => {
    const threads = await threadService.getThreads();
    ApiResponse.success(res, threads, 'Threads fetched successfully');
});

export const getThread = catchAsync(async (req: Request, res: Response) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const thread = await threadService.getThreadById(threadId);
    if (!thread) {
        return ApiResponse.notFound(res, 'Thread not found');
    }
    return ApiResponse.success(res, thread, 'Thread fetched successfully');
});

export const createComment = catchAsync(async (req: Request, res: Response) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const comment = await threadService.createComment({
        ...req.body,
        threadId: threadId,
        authorId: req.user.id,
    });
    return ApiResponse.created(res, comment, 'Comment added successfully');
});


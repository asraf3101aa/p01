import catchAsync from '../utils/catchAsync';
import { threadService, notificationService } from '../services';
import ApiResponse from '../utils/ApiResponse';

export const createThread = catchAsync(async (req, res) => {
    if (!req.user.isEmailVerified) {
        return ApiResponse.forbidden(res, 'Please verify your email before creating a thread');
    }

    const { thread, message } = await threadService.createThread({
        ...req.body,
        authorId: req.user.id,
    });

    if (!thread) {
        return ApiResponse.error(res, message);
    }
    return ApiResponse.created(res, thread, message);
});

export const getThreads = catchAsync(async (req, res) => {
    const page = parseInt(req.query['page'] as string, 10) || 1;
    const limit = parseInt(req.query['limit'] as string, 10) || 10;
    const { results, totalResults, message } = await threadService.getThreads(page, limit, req.user?.id);
    if (!results) {
        return ApiResponse.error(res, message || 'Something went wrong');
    }
    return ApiResponse.paginate(res, results, {
        totalItems: totalResults || 0,
        itemsPerPage: limit,
        currentPage: page
    }, message);
});

export const getUserThreads = catchAsync(async (req, res) => {
    const userId = parseInt(req.params['id'] as string, 10);
    const page = parseInt(req.query['page'] as string, 10) || 1;
    const limit = parseInt(req.query['limit'] as string, 10) || 10;
    const { results, totalResults, message } = await threadService.getThreadsByAuthorId(userId, page, limit, req.user?.id);
    if (!results) {
        return ApiResponse.error(res, message || 'Failed to fetch user threads');
    }
    return ApiResponse.paginate(res, results, {
        totalItems: totalResults || 0,
        itemsPerPage: limit,
        currentPage: page
    }, message);
});

export const getThread = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const { thread, message } = await threadService.getThreadById(threadId, req.user?.id);
    if (!thread) {
        return ApiResponse.notFound(res, message || 'Thread not found');
    }
    return ApiResponse.success(res, thread, message);
});

export const createComment = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const { thread, message: threadMsg } = await threadService.getThreadById(threadId);

    if (!thread) {
        return ApiResponse.notFound(res, threadMsg || 'Thread not found');
    }

    const { comment, message } = await threadService.createComment({
        ...req.body,
        threadId: threadId,
        authorId: req.user.id,
    });

    if (!comment) {
        return ApiResponse.error(res, message);
    }

    // Notify all subscribers except the commenter
    const { subscribers } = await threadService.getThreadSubscribers(threadId);
    if (subscribers) {
        for (const sub of subscribers) {
            if (sub.userId !== req.user.id) {
                await notificationService.sendNotification(
                    sub.userId,
                    'New comment on thread',
                    `${req.user.username} commented on a thread you follow`,
                    'thread_comment'
                );
            }
        }
    }

    return ApiResponse.created(res, comment, message);
});

export const subscribe = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const userId = req.user.id;

    const { subscription } = await threadService.getSubscription(threadId, userId);
    if (subscription) {
        return ApiResponse.success(res, null, 'Already subscribed');
    }

    const { message } = await threadService.subscribeToThread({ threadId, userId });
    return ApiResponse.success(res, null, message);
});

export const unsubscribe = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const userId = req.user.id;

    const { message } = await threadService.unsubscribeFromThread(threadId, userId);
    return ApiResponse.success(res, null, message);
});

export const like = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const userId = req.user.id;

    const { like } = await threadService.getLike(threadId, userId);
    if (like) {
        return ApiResponse.success(res, null, 'Already liked');
    }

    const { message } = await threadService.likeThread({ threadId, userId });
    return ApiResponse.success(res, null, message);
});

export const unlike = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const userId = req.user.id;

    const { message } = await threadService.unlikeThread(threadId, userId);
    return ApiResponse.success(res, null, message);
});

export const deleteThread = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const userId = req.user.id;

    const { thread, message } = await threadService.deleteThread(threadId, userId);
    if (!thread) {
        return ApiResponse.error(res, message);
    }
    return ApiResponse.success(res, null, message);
});

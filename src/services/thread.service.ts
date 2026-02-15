import { db } from '../db';
import { threads, comments, threadSubscribers, threadLikes, threadImages } from '../db/schema';
import { NewThread, NewComment, NewThreadSubscriber, NewThreadLike } from '../models/thread.model';
import { eq, and, desc, count, inArray } from 'drizzle-orm';
import { serviceError } from '../utils/serviceError';

export const createThread = async (thread: NewThread & { imagesPath?: string[] }) => {
    try {
        const { imagesPath, ...threadData } = thread;
        const newThread = await db.transaction(async (trx) => {
            const [createdThread] = await trx.insert(threads)
                .values(threadData)
                .returning();

            if (!createdThread) {
                throw new Error("Failed to create thread");
            }

            if (imagesPath?.length) {
                await trx.insert(threadImages).values(
                    imagesPath.map(path => ({
                        path,
                        threadId: createdThread.id
                    }))
                );
            }

            const [subscription] = await trx.insert(threadSubscribers)
                .values({ threadId: createdThread.id, userId: threadData.authorId })
                .returning();

            if (!subscription) {
                throw new Error("Failed to subscribe author to thread");
            }

            return createdThread;
        });

        return { thread: newThread, message: "Thread created successfully" };
    } catch (error: any) {
        return { thread: null, ...serviceError(error, "Failed to create thread") };
    }
};

export const getThreads = async (page: number = 1, limit: number = 10, currentUserId?: number) => {
    try {
        const offset = (page - 1) * limit;

        const threadsData = await db.query.threads.findMany({
            where: eq(threads.isDeleted, false),
            with: {
                author: {
                    columns: {
                        id: true,
                        username: true,
                        name: true,
                        avatarPath: true,
                    }
                },
                imagePaths: {
                    columns: { id: true, path: true, createdAt: true }
                },
            },
            orderBy: desc(threads.createdAt),
            limit,
            offset,
        });

        if (threadsData.length === 0) {
            return { results: [], page, limit, totalPages: 0, totalResults: 0, message: "Threads fetched successfully" };
        }

        const threadIds = threadsData.map(t => t.id);

        const [likeCounts, commentCounts, subCounts, userLikes, userSubs, countResult] = await Promise.all([
            db.select({ threadId: threadLikes.threadId, count: count() })
                .from(threadLikes)
                .where(inArray(threadLikes.threadId, threadIds))
                .groupBy(threadLikes.threadId),
            db.select({ threadId: comments.threadId, count: count() })
                .from(comments)
                .where(inArray(comments.threadId, threadIds))
                .groupBy(comments.threadId),
            db.select({ threadId: threadSubscribers.threadId, count: count() })
                .from(threadSubscribers)
                .where(inArray(threadSubscribers.threadId, threadIds))
                .groupBy(threadSubscribers.threadId),
            currentUserId
                ? db.select({ threadId: threadLikes.threadId })
                    .from(threadLikes)
                    .where(and(eq(threadLikes.userId, currentUserId), inArray(threadLikes.threadId, threadIds)))
                : Promise.resolve([]),
            currentUserId
                ? db.select({ threadId: threadSubscribers.threadId })
                    .from(threadSubscribers)
                    .where(and(eq(threadSubscribers.userId, currentUserId), inArray(threadSubscribers.threadId, threadIds)))
                : Promise.resolve([]),
            db.select({ count: count() })
                .from(threads)
                .where(eq(threads.isDeleted, false))
        ]);

        const likeCountMap = new Map(likeCounts.map(c => [c.threadId, c.count]));
        const commentCountMap = new Map(commentCounts.map(c => [c.threadId, c.count]));
        const subCountMap = new Map(subCounts.map(c => [c.threadId, c.count]));
        const userLikeSet = new Set(userLikes.map(l => l.threadId));
        const userSubSet = new Set(userSubs.map(s => s.threadId));

        const results = threadsData.map(thread => ({
            ...thread,
            isEdited: !!(thread.updatedAt && thread.updatedAt > thread.createdAt),
            likeCount: likeCountMap.get(thread.id) || 0,
            commentCount: commentCountMap.get(thread.id) || 0,
            subscriberCount: subCountMap.get(thread.id) || 0,
            isLiked: userLikeSet.has(thread.id),
            isSubscribed: userSubSet.has(thread.id),
        }));

        const totalResults = countResult[0]?.count ?? 0;

        return {
            results,
            page,
            limit,
            totalPages: Math.ceil(totalResults / limit),
            totalResults,
            message: "Threads fetched successfully"
        };
    } catch (error: any) {
        return { results: null, totalResults: 0, ...serviceError(error, "Failed to fetch threads") };
    }
};

export const getThreadsByAuthorId = async (authorId: number, page: number = 1, limit: number = 10, currentUserId?: number) => {
    try {
        const offset = (page - 1) * limit;

        const threadsData = await db.query.threads.findMany({
            where: and(eq(threads.authorId, authorId), eq(threads.isDeleted, false)),
            with: {
                author: {
                    columns: {
                        id: true,
                        username: true,
                        name: true,
                        avatarPath: true,

                    }
                },
                imagePaths: {
                    columns: { id: true, path: true, createdAt: true }
                },
            },
            orderBy: desc(threads.createdAt),
            limit,
            offset,
        });

        if (threadsData.length === 0) {
            return { results: [], page, limit, totalPages: 0, totalResults: 0, message: "User threads fetched successfully" };
        }

        const threadIds = threadsData.map(t => t.id);

        const [likeCounts, commentCounts, subCounts, userLikes, userSubs] = await Promise.all([
            db.select({ threadId: threadLikes.threadId, count: count() }).from(threadLikes).where(inArray(threadLikes.threadId, threadIds)).groupBy(threadLikes.threadId),
            db.select({ threadId: comments.threadId, count: count() }).from(comments).where(inArray(comments.threadId, threadIds)).groupBy(comments.threadId),
            db.select({ threadId: threadSubscribers.threadId, count: count() }).from(threadSubscribers).where(inArray(threadSubscribers.threadId, threadIds)).groupBy(threadSubscribers.threadId),
            currentUserId ? db.select({ threadId: threadLikes.threadId }).from(threadLikes).where(and(eq(threadLikes.userId, currentUserId), inArray(threadLikes.threadId, threadIds))) : Promise.resolve([]),
            currentUserId ? db.select({ threadId: threadSubscribers.threadId }).from(threadSubscribers).where(and(eq(threadSubscribers.userId, currentUserId), inArray(threadSubscribers.threadId, threadIds))) : Promise.resolve([]),
        ]);

        const results = threadsData.map(thread => ({
            ...thread,
            isEdited: !!(thread.updatedAt && thread.updatedAt > thread.createdAt),
            likeCount: likeCounts.find(c => c.threadId === thread.id)?.count || 0,
            commentCount: commentCounts.find(c => c.threadId === thread.id)?.count || 0,
            subscriberCount: subCounts.find(c => c.threadId === thread.id)?.count || 0,
            isLiked: userLikes.some(l => l.threadId === thread.id),
            isSubscribed: userSubs.some(s => s.threadId === thread.id),
        }));

        const countResult = await db.select({ count: count() })
            .from(threads)
            .where(and(eq(threads.authorId, authorId), eq(threads.isDeleted, false)));
        const totalResults = countResult[0]?.count ?? 0;

        return {
            results,
            page,
            limit,
            totalPages: Math.ceil(totalResults / limit),
            totalResults,
            message: "User threads fetched successfully"
        };
    } catch (error: any) {
        return { results: [], totalResults: 0, ...serviceError(error, "Failed to fetch user threads") };
    }
};

export const getThreadById = async (id: number, currentUserId?: number) => {
    try {
        const threadData = await db.query.threads.findFirst({
            where: and(eq(threads.id, id), eq(threads.isDeleted, false)),
            with: {
                author: {
                    columns: {
                        id: true,
                        username: true,
                        name: true,
                        avatarPath: true,
                    }
                },
                imagePaths: {
                    columns: { id: true, path: true, createdAt: true }
                },
                comments: {
                    with: {
                        author: {
                            columns: {
                                id: true,
                                username: true,
                                name: true,
                                avatarPath: true,
                            }
                        }
                    },
                    orderBy: desc(comments.createdAt),
                }
            },
        });

        if (!threadData) return { thread: null, message: "Thread not found" };

        const [[likeCount], [commentCount], [subCount], [userLike], [userSub]] = await Promise.all([
            db.select({ count: count() }).from(threadLikes).where(eq(threadLikes.threadId, id)),
            db.select({ count: count() }).from(comments).where(eq(comments.threadId, id)),
            db.select({ count: count() }).from(threadSubscribers).where(eq(threadSubscribers.threadId, id)),
            currentUserId ? db.select({ id: threadLikes.id }).from(threadLikes).where(and(eq(threadLikes.threadId, id), eq(threadLikes.userId, currentUserId))).limit(1) : Promise.resolve([]),
            currentUserId ? db.select({ id: threadSubscribers.id }).from(threadSubscribers).where(and(eq(threadSubscribers.threadId, id), eq(threadSubscribers.userId, currentUserId))).limit(1) : Promise.resolve([]),
        ]);

        const thread = {
            ...threadData,
            isEdited: !!(threadData.updatedAt && threadData.updatedAt > threadData.createdAt),
            comments: threadData.comments.map(c => ({
                ...c,
                isEdited: !!(c.updatedAt && c.updatedAt > c.createdAt),
            })),
            likeCount: likeCount?.count || 0,
            commentCount: commentCount?.count || 0,
            subscriberCount: subCount?.count || 0,
            isLiked: !!userLike,
            isSubscribed: !!userSub,
        };

        return { thread, message: "Thread fetched successfully" };
    } catch (error: any) {
        return { thread: null, ...serviceError(error, "Failed to fetch thread") };
    }
};

export const createComment = async (comment: NewComment) => {
    try {
        const [newComment] = await db.insert(comments).values(comment).returning();
        return { comment: newComment, message: "Comment added successfully" };
    } catch (error: any) {
        return { comment: null, ...serviceError(error, "Failed to add comment") };
    }
};

export const getThreadComments = async (threadId: number, page: number = 1, limit: number = 10) => {
    try {
        const offset = (page - 1) * limit;

        const results = await db.query.comments.findMany({
            where: eq(comments.threadId, threadId),
            with: {
                author: {
                    columns: {
                        id: true,
                        username: true,
                        name: true,
                        avatarPath: true,
                    }
                }
            },
            orderBy: desc(comments.createdAt),
            limit,
            offset,
        });

        const countResult = await db.select({ count: count() })
            .from(comments)
            .where(eq(comments.threadId, threadId));

        const totalResults = countResult[0]?.count ?? 0;

        return {
            results: results.map(c => ({
                ...c,
                isEdited: !!(c.updatedAt && c.updatedAt > c.createdAt),
            })),
            totalResults,
            page,
            limit,
            totalPages: Math.ceil(totalResults / limit),
            message: "Comments fetched successfully"
        };
    } catch (error: any) {
        return { results: null, totalResults: 0, ...serviceError(error, "Failed to fetch comments") };
    }
};

export const subscribeToThread = async (subscription: NewThreadSubscriber) => {
    try {
        const [newSubscription] = await db.insert(threadSubscribers).values(subscription).returning();
        return { subscription: newSubscription, message: "Subscribed successfully" };
    } catch (error: any) {
        return { subscription: null, ...serviceError(error, "Failed to subscribe") };
    }
};

export const unsubscribeFromThread = async (threadId: number, userId: number) => {
    try {
        await db.delete(threadSubscribers).where(
            and(
                eq(threadSubscribers.threadId, threadId),
                eq(threadSubscribers.userId, userId)
            )
        );
        return { message: "Unsubscribed successfully" };
    } catch (error: any) {
        return { ...serviceError(error, "Failed to unsubscribe") };
    }
};

export const getSubscription = async (threadId: number, userId: number) => {
    try {
        const [subscription] = await db.select()
            .from(threadSubscribers)
            .where(
                and(
                    eq(threadSubscribers.threadId, threadId),
                    eq(threadSubscribers.userId, userId)
                )
            )
            .limit(1);
        return { subscription, message: subscription ? "Subscription found" : "No subscription found" };
    } catch (error: any) {
        return { subscription: null, ...serviceError(error, "Failed to get subscription") };
    }
};

export const getThreadSubscribers = async (threadId: number) => {
    try {
        const subscribers = await db.select()
            .from(threadSubscribers)
            .where(eq(threadSubscribers.threadId, threadId));
        return { subscribers, message: "Subscribers fetched successfully" };
    } catch (error: any) {
        return { subscribers: [], ...serviceError(error, "Failed to fetch subscribers") };
    }
};

export const likeThread = async (like: NewThreadLike) => {
    try {
        const [newLike] = await db.insert(threadLikes).values(like).returning();
        return { like: newLike, message: "Thread liked successfully" };
    } catch (error: any) {
        return { like: null, ...serviceError(error, "Failed to like thread") };
    }
};

export const unlikeThread = async (threadId: number, userId: number) => {
    try {
        await db.delete(threadLikes).where(
            and(
                eq(threadLikes.threadId, threadId),
                eq(threadLikes.userId, userId)
            )
        );
        return { message: "Thread unliked successfully" };
    } catch (error: any) {
        return { ...serviceError(error, "Failed to unlike thread") };
    }
};

export const getLike = async (threadId: number, userId: number) => {
    try {
        const [like] = await db.select()
            .from(threadLikes)
            .where(
                and(
                    eq(threadLikes.threadId, threadId),
                    eq(threadLikes.userId, userId)
                )
            )
            .limit(1);
        return { like, message: like ? "Like found" : "No like found" };
    } catch (error: any) {
        return { like: null, ...serviceError(error, "Failed to get like") };
    }
};

export const deleteThread = async (id: number, authorId: number) => {
    try {
        const [thread] = await db.update(threads)
            .set({ isDeleted: true })
            .where(and(eq(threads.id, id), eq(threads.isDeleted, false), eq(threads.authorId, authorId)))
            .returning();
        if (!thread) return { thread: null, message: "Thread not found or you're not the author" };
        return { thread, message: "Thread deleted successfully" };
    } catch (error: any) {
        return { thread: null, ...serviceError(error, "Failed to delete thread") };
    }
};

export const updateThread = async (id: number, authorId: number, updateData: { content?: string }) => {
    try {
        const [thread] = await db.update(threads)
            .set(updateData)
            .where(and(eq(threads.id, id), eq(threads.isDeleted, false), eq(threads.authorId, authorId)))
            .returning();
        if (!thread) return { thread: null, message: "Thread not found or you're not the author" };
        return { thread, message: "Thread updated successfully" };
    } catch (error: any) {
        return { thread: null, ...serviceError(error, "Failed to update thread") };
    }
};

export const updateComment = async (id: number, authorId: number, updateData: { content?: string }) => {
    try {
        const [comment] = await db.update(comments)
            .set(updateData)
            .where(and(eq(comments.id, id), eq(comments.authorId, authorId)))
            .returning();
        if (!comment) return { comment: null, message: "Comment not found or you're not the author" };
        return { comment, message: "Comment updated successfully" };
    } catch (error: any) {
        return { comment: null, ...serviceError(error, "Failed to update comment") };
    }
};

export const deleteComment = async (id: number, authorId: number) => {
    try {
        const [comment] = await db.delete(comments)
            .where(and(eq(comments.id, id), eq(comments.authorId, authorId)))
            .returning();
        if (!comment) return { comment: null, message: "Comment not found or you're not the author" };
        return { comment, message: "Comment deleted successfully" };
    } catch (error: any) {
        return { comment: null, ...serviceError(error, "Failed to delete comment") };
    }
};

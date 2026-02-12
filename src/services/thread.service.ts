import { db } from '../db';
import { threads, comments, users, threadSubscribers } from '../db/schema';
import { NewThread, NewComment, NewThreadSubscriber } from '../models/thread.model';
import { eq, and, desc } from 'drizzle-orm';

export const createThread = async (thread: NewThread) => {
    const [newThread] = await db.insert(threads).values(thread).returning();
    return newThread;
};

export const getThreads = async () => {
    return db.select({
        id: threads.id,
        title: threads.title,
        description: threads.description,
        createdAt: threads.createdAt,
        author: {
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
        }
    })
        .from(threads)
        .innerJoin(users, eq(threads.authorId, users.id))
        .where(eq(threads.isDeleted, false))
        .orderBy(desc(threads.createdAt));
};

export const getThreadById = async (id: number) => {
    const [thread] = await db.select({
        id: threads.id,
        title: threads.title,
        description: threads.description,
        createdAt: threads.createdAt,
        author: {
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
        }
    })
        .from(threads)
        .innerJoin(users, eq(threads.authorId, users.id))
        .where(and(eq(threads.id, id), eq(threads.isDeleted, false)))
        .limit(1);

    if (!thread) return null;

    const threadComments = await db.select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        author: {
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
        }
    })
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.threadId, id))
        .orderBy(desc(comments.createdAt));

    return { ...thread, comments: threadComments };
};

export const createComment = async (comment: NewComment) => {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
};

export const subscribeToThread = async (subscription: NewThreadSubscriber) => {
    const [newSubscription] = await db.insert(threadSubscribers).values(subscription).returning();
    return newSubscription;
};

export const unsubscribeFromThread = async (threadId: number, userId: number) => {
    await db.delete(threadSubscribers).where(
        and(
            eq(threadSubscribers.threadId, threadId),
            eq(threadSubscribers.userId, userId)
        )
    );
};

export const getSubscription = async (threadId: number, userId: number) => {
    const [subscription] = await db.select()
        .from(threadSubscribers)
        .where(
            and(
                eq(threadSubscribers.threadId, threadId),
                eq(threadSubscribers.userId, userId)
            )
        )
        .limit(1);
    return subscription;
};

export const getThreadSubscribers = async (threadId: number) => {
    return db.select()
        .from(threadSubscribers)
        .where(eq(threadSubscribers.threadId, threadId));
};

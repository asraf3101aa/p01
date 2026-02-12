import { db } from '../db';
import { notifications, notificationPreferences } from '../db/schema';
import { NewNotificationPreference } from '../models/notification.model';
import { eq, and, desc } from 'drizzle-orm';
import logger from '../config/logger';

export const getPreferences = async (userId: number) => {
    let prefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, userId),
    });

    if (!prefs) {
        const [newPrefs] = await db.insert(notificationPreferences).values({
            userId,
        }).returning();
        return newPrefs;
    }

    return prefs;
};

export const updatePreferences = async (userId: number, updateData: Partial<NewNotificationPreference>) => {
    const [updated] = await db.update(notificationPreferences)
        .set(updateData)
        .where(eq(notificationPreferences.userId, userId))
        .returning();
    return updated;
};

export const getNotifications = async (userId: number) => {
    return db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
};

export const markAsRead = async (notificationId: number, userId: number) => {
    const [updated] = await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
        .returning();
    return updated;
};

export const createInAppNotification = async (userId: number, title: string, message: string, type: string) => {
    const [notification] = await db.insert(notifications).values({
        userId,
        title,
        message,
        type,
    }).returning();
    logger.info(`In-app notification created for user ${userId}: ${title}`);
    return notification;
};

export const sendNotification = async (userId: number, title: string, message: string, type: string) => {
    // Dynamic import to avoid circular dependency
    const { addNotificationJob } = await import('../queues/notification.queue');
    await addNotificationJob({ userId, title, message, type });
};


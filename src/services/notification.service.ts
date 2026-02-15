import { db } from '../db';
import { notifications, notificationPreferences } from '../db/schema';
import { NewNotificationPreference } from '../models/notification.model';
import { eq, and, desc } from 'drizzle-orm';
import logger from '../config/logger';
import { serviceError } from '../utils/serviceError';

export const getPreferences = async (userId: number) => {
    try {
        let prefs = await db.query.notificationPreferences.findFirst({
            where: eq(notificationPreferences.userId, userId),
        });

        if (!prefs) {
            const [newPrefs] = await db.insert(notificationPreferences).values({
                userId,
            }).returning();
            return { prefs: newPrefs, message: 'Notification preferences retrieved successfully' };
        }

        return { prefs: prefs, message: 'Notification preferences retrieved successfully' };
    } catch (error: any) {
        return { prefs: null, ...serviceError(error, 'Failed to get preferences') };
    }
};

export const updatePreferences = async (userId: number, updateData: Partial<NewNotificationPreference>) => {
    try {
        const [updated] = await db.update(notificationPreferences)
            .set(updateData)
            .where(eq(notificationPreferences.userId, userId))
            .returning();
        return { prefs: updated, message: 'Notification preferences updated successfully' };
    } catch (error: any) {
        return { prefs: null, ...serviceError(error, 'Failed to update preferences') };
    }
};

export const getNotifications = async (userId: number) => {
    try {
        const results = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt));
        return { notifications: results, message: 'Notifications retrieved successfully' };
    } catch (error: any) {
        return { notifications: [], ...serviceError(error, 'Failed to get notifications') };
    }
};

export const markAsRead = async (notificationId: number, userId: number) => {
    try {
        const [updated] = await db.update(notifications)
            .set({ isRead: true })
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .returning();
        return { notification: updated, message: 'Notification marked as read' };
    } catch (error: any) {
        return { notification: null, ...serviceError(error, 'Failed to mark notification as read') };
    }
};

export const createInAppNotification = async (userId: number, title: string, message: string, type: string) => {
    try {
        const [notification] = await db.insert(notifications).values({
            userId,
            title,
            message,
            type,
        }).returning();
        logger.info(`In-app notification created for user ${userId}: ${title}`);
        return { notification, message: 'In-app notification created successfully' };
    } catch (error: any) {
        return { notification: null, ...serviceError(error, 'Failed to create in-app notification') };
    }
};

export const sendNotification = async (userId: number, title: string, message: string, type: string) => {
    try {
        const { addNotificationJob } = await import('../queues/notification.queue');
        await addNotificationJob({ userId, title, message, type });
        return { message: 'Notification job added successfully' };
    } catch (error: any) {
        return { ...serviceError(error, 'Failed to send notification') };
    }
};

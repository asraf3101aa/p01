import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { notificationService } from '../services';
import ApiResponse from '../utils/ApiResponse';

export const getPreferences = catchAsync(async (req: Request, res: Response) => {
    const prefs = await notificationService.getPreferences(req.user.id);
    ApiResponse.success(res, prefs, 'Notification preferences fetched successfully');
});

export const updatePreferences = catchAsync(async (req: Request, res: Response) => {
    const prefs = await notificationService.updatePreferences(req.user.id, req.body);
    ApiResponse.success(res, prefs, 'Notification preferences updated successfully');
});

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
    const notifications = await notificationService.getNotifications(req.user.id);
    ApiResponse.success(res, notifications, 'Notifications fetched successfully');
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(parseInt(req.params['id'] as string, 10), req.user.id);
    if (!notification) {
        return ApiResponse.notFound(res, 'Notification not found');
    }
    return ApiResponse.success(res, notification, 'Notification marked as read');
});

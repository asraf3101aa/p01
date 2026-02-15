import catchAsync from '../utils/catchAsync';
import { notificationService } from '../services';
import ApiResponse from '../utils/ApiResponse';

export const getPreferences = catchAsync(async (req, res) => {
    const { prefs, message } = await notificationService.getPreferences(req.user.id);
    return ApiResponse.success(res, prefs, message);
});

export const updatePreferences = catchAsync(async (req, res) => {
    const { prefs, message } = await notificationService.updatePreferences(req.user.id, req.body);
    return ApiResponse.success(res, prefs, message);
});

export const getNotifications = catchAsync(async (req, res) => {
    const { notifications, message } = await notificationService.getNotifications(req.user.id);
    return ApiResponse.success(res, notifications, message);
});

export const markAsRead = catchAsync(async (req, res) => {
    const { notification, message } = await notificationService.markAsRead(parseInt(req.params['id'] as string, 10), req.user.id);
    if (!notification) {
        return ApiResponse.notFound(res, message || 'Notification not found');
    }
    return ApiResponse.success(res, notification, message);
});

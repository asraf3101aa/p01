import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import ApiResponse from '../utils/ApiResponse';

export const getProfileById = catchAsync(async (req, res) => {
    const userId = parseInt(req.params['id'] as string, 10);
    const { user, message } = await userService.getUserById(userId);
    if (!user) {
        return ApiResponse.notFound(res, message || 'User not found');
    }
    return ApiResponse.success(res, user, message);
});

export const updateProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { user, message } = await userService.updateUserById(userId, req.body);
    if (!user) {
        return ApiResponse.error(res, message || 'Failed to update profile');
    }
    return ApiResponse.success(res, user, message);
});

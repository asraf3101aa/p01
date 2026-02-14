import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import ApiResponse from '../utils/ApiResponse';

export const getProfileById = catchAsync(async (req, res) => {
    const userId = parseInt(req.params['id'] as string, 10);
    const user = await userService.getUserById(userId);
    if (!user) {
        ApiResponse.notFound(res, 'User not found');
        return;
    }
    ApiResponse.success(res, user, 'User profile fetched successfully');
});

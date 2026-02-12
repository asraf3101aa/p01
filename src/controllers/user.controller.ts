import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import ApiResponse from '../utils/ApiResponse';

export const getProfile = catchAsync(async (req: Request, res: Response) => {
    ApiResponse.success(res, req.user, 'User profile fetched successfully');
});

export const getProfileById = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params['id'] as string, 10);
    const user = await userService.getUserById(userId);
    if (!user) {
        ApiResponse.notFound(res, 'User not found');
        return;
    }
    ApiResponse.success(res, user, 'User profile fetched successfully');
});

import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import * as tokenService from '../services/token.service';
import ApiResponse from '../utils/ApiResponse';
import { status as httpStatus } from 'http-status';
import { authService } from '../services';

export const register = catchAsync(async (req, res) => {
    const { user, message } = await userService.createUser(req.body);
    if (!user) {
        return ApiResponse.error(res, message);
    }
    return ApiResponse.created(res, user, message);
});

export const login = catchAsync(async (req, res) => {
    const { identifier, password } = req.body;
    const { user } = await authService.loginUserWithEmailOrUsernameAndPassword(identifier, password);
    if (!user) {
        return ApiResponse.fail(res, 'Incorrect email/username or password', httpStatus.UNAUTHORIZED);
    }
    const { tokens, message: tokenMessage } = await tokenService.generateAuthTokens(user.id);
    if (!tokens) {
        return ApiResponse.error(res, tokenMessage);
    }
    return ApiResponse.success(res, { user, tokens }, tokenMessage);
});

export const refreshTokens = catchAsync(async (req, res) => {
    const { refreshToken: token } = req.body;
    const { tokens, message } = await authService.refreshAuth(token);
    if (!tokens) {
        return ApiResponse.fail(res, message, httpStatus.UNAUTHORIZED);
    }
    return ApiResponse.success(res, tokens, message);
});

export const getAuthUserProfile = catchAsync(async (req, res) => {
    return ApiResponse.success(res, req.user, 'User profile fetched successfully');
});

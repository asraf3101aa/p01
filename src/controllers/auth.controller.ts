import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import * as tokenService from '../services/token.service';
import ApiResponse from '../utils/ApiResponse';
import { status as httpStatus } from 'http-status';
import { authService } from '../services';

export const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    ApiResponse.created(res, user, 'User registered successfully');
});

export const login = catchAsync(async (req, res) => {
    const { identifier, password } = req.body;
    const user = await authService.loginUserWithEmailOrUsernameAndPassword(identifier, password);
    if (!user) {
        ApiResponse.fail(res, 'Incorrect email/username or password', httpStatus.UNAUTHORIZED);
        return;
    }
    const tokens = await tokenService.generateAuthTokens(user.id);
    ApiResponse.success(res, { user, tokens }, 'Login successful');
});

export const refreshTokens = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAuth(refreshToken);
    if (!tokens) {
        ApiResponse.fail(res, 'Invalid refresh token', httpStatus.UNAUTHORIZED);
        return;
    }
    ApiResponse.success(res, { ...tokens }, 'Tokens refreshed successfully');
});

export const getAuthUserProfile = catchAsync(async (req, res) => {
    ApiResponse.success(res, req.user, 'User profile fetched successfully');
});


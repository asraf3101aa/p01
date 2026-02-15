import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import * as tokenService from '../services/token.service';
import ApiResponse from '../utils/ApiResponse';
import { status as httpStatus } from 'http-status';
import { authService, emailService } from '../services';
import config from '../config';

export const register = catchAsync(async (req, res) => {
    const { user, message } = await userService.createUser(req.body);
    if (!user) {
        return ApiResponse.error(res, message);
    }
    const { tokens, message: tokenMessage } = await tokenService.generateAuthTokens(user.id);
    if (!tokens) {
        return ApiResponse.error(res, tokenMessage);
    }

    const { token: verificationToken } = await tokenService.generateVerificationToken(user.email);
    if (verificationToken) {
        await emailService.sendVerificationEmail(user.email, verificationToken);
    }

    return ApiResponse.created(res, { user, tokens }, message);
});

export const verifyEmail = catchAsync(async (req, res) => {
    const token = req.query['token'] as string;
    const { payload, message: verifyMessage } = await tokenService.verifyToken(token, config.jwt.accessTokenSecret);

    if (!payload) {
        return ApiResponse.error(res, verifyMessage);
    }

    const email = payload.sub as string;
    const { user: userByEmail } = await userService.getUserByIdentifier(email);

    if (!userByEmail) {
        return ApiResponse.error(res, 'User not found');
    }

    if (userByEmail.isEmailVerified) {
        return ApiResponse.success(res, null, 'Email is already verified');
    }

    const { user, message: userMessage } = await userService.updateUserById(userByEmail.id, { isEmailVerified: true });

    if (!user) {
        return ApiResponse.error(res, userMessage || 'Failed to verify email');
    }

    return ApiResponse.success(res, null, 'Email verified successfully');
});

export const resendVerificationEmail = catchAsync(async (req, res) => {
    const { email } = req.body;
    const { user } = await userService.getUserByIdentifier(email);

    if (!user) {
        return ApiResponse.error(res, 'User not found');
    }

    if (user.isEmailVerified) {
        return ApiResponse.error(res, 'Email already verified');
    }

    const { token: verificationToken } = await tokenService.generateVerificationToken(user.email);
    if (verificationToken) {
        await emailService.sendVerificationEmail(user.email, verificationToken);
    }

    return ApiResponse.success(res, null, 'Verification email resent successfully');
});

export const login = catchAsync(async (req, res) => {
    const { identifier, password } = req.body;
    const { user, message } = await authService.loginUserWithEmailOrUsernameAndPassword(identifier, password);
    if (!user) {
        return ApiResponse.unauthorized(res, message);
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
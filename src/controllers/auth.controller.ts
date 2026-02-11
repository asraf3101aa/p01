import catchAsync from '../utils/catchAsync';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import * as tokenService from '../services/token.service';
import ApiResponse from '../utils/ApiResponse';

export const register = catchAsync(async (req, res) => {
    await userService.createUser(req.body);
    ApiResponse.created(res, null, 'User registered successfully');
});

export const login = catchAsync(async (req, res) => {
    const { identifier, password } = req.body;
    const user = await authService.loginUserWithEmailOrUsernameAndPassword(identifier, password);
    const tokens = await tokenService.generateAuthTokens(user.id);
    ApiResponse.success(res, { user, tokens }, 'Login successful');
});

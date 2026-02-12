import { Request, Response, NextFunction } from 'express';
import { status as httpStatus } from 'http-status';
import { ApiError } from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || httpStatus[statusCode as keyof typeof httpStatus];

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.message && err.message.includes('UNIQUE constraint failed')) {
        statusCode = httpStatus.BAD_REQUEST;
        const field = err.message.split('.').pop() || 'field';
        message = `User with this ${field} already exists`;
    }

    ApiResponse.fail(res, message as string, statusCode);
};

import { Response } from 'express';
import { status as httpStatus } from 'http-status';

class ApiResponse {
    static success(res: Response, data: any, message: string | null, statusCode: number = httpStatus.OK) {
        return res.status(statusCode).json({
            status: 'success',
            message,
            data,
        });
    }

    static paginate(res: Response, items: any[], meta: { totalItems: number, itemsPerPage: number, currentPage: number }, message: string | null = null) {
        return this.success(res, {
            items,
            meta: {
                totalItems: meta.totalItems,
                itemCount: items.length,
                itemsPerPage: meta.itemsPerPage,
                totalPages: Math.ceil(meta.totalItems / meta.itemsPerPage),
                currentPage: meta.currentPage
            }
        }, message);
    }

    static fail(res: Response, message: string | null, statusCode: number = httpStatus.BAD_REQUEST, errors: any = null) {
        return res.status(statusCode).json({
            status: 'fail',
            message,
            ...(errors && { errors }),
        });
    }

    static error(res: Response, message: string | null, statusCode: number = httpStatus.INTERNAL_SERVER_ERROR) {
        return res.status(statusCode).json({
            status: 'error',
            message,
        });
    }


    static created(res: Response, data: any, message: string = 'Resource created') {
        return this.success(res, data, message, httpStatus.CREATED);
    }

    static badRequest(res: Response, message: string = 'Bad Request', errors: Record<string, string[]> | null = null) {
        return this.fail(res, message, httpStatus.BAD_REQUEST, errors);
    }

    static unauthorized(res: Response, message: string = 'Unauthorized') {
        return this.fail(res, message, httpStatus.UNAUTHORIZED);
    }

    static forbidden(res: Response, message: string = 'Forbidden') {
        return this.fail(res, message, httpStatus.FORBIDDEN);
    }

    static notFound(res: Response, message: string = 'Not Found') {
        return this.fail(res, message, httpStatus.NOT_FOUND);
    }

    static internalServerError(res: Response, message: string = 'Internal Server Error') {
        return this.error(res, message, httpStatus.INTERNAL_SERVER_ERROR);
    }
}

export default ApiResponse;
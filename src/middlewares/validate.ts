import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import httpStatus from 'http-status';

const validate = (schema: { body?: ZodObject<any>; query?: ZodObject<any>; params?: ZodObject<any> }) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                const parsedBody = schema.body.parse(req.body);
                Object.keys(req.body).forEach((key) => delete (req.body as any)[key]);
                Object.assign(req.body, parsedBody);
            }
            if (schema.query) {
                const parsedQuery = schema.query.parse(req.query);
                Object.keys(req.query).forEach((key) => delete (req.query as any)[key]);
                Object.assign(req.query, parsedQuery);
            }
            if (schema.params) {
                const parsedParams = schema.params.parse(req.params);
                Object.keys(req.params).forEach((key) => delete (req.params as any)[key]);
                Object.assign(req.params, parsedParams);
            }
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};

                error.issues.forEach((issue) => {
                    const key = issue.path.join('.') || 'root';

                    if (!errors[key]) {
                        errors[key] = [];
                    }

                    errors[key].push(issue.message);
                });

                return res.status(httpStatus.BAD_REQUEST).send({
                    status: 'error',
                    message: 'Validation failed',
                    errors,
                });
            }
            return next(error);
        }
    };

export default validate;
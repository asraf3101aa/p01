import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import httpStatus from 'http-status';

const validate = (schema: { body?: ZodObject<any>; query?: ZodObject<any>; params?: ZodObject<any> }) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query) as any;
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params) as any;
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

                    // Add the message to the list for this key
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
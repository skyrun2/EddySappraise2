import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

type ValidationSchema = {
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
};

export const validate = (schema: ValidationSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            // Simple validation - check if required fields exist
            if (schema.body) {
                for (const key in schema.body) {
                    if (!(key in req.body)) {
                        throw ApiError.badRequest(`Missing required field: ${key}`);
                    }
                }
            }

            if (schema.params) {
                for (const key in schema.params) {
                    if (!(key in req.params)) {
                        throw ApiError.badRequest(`Missing required param: ${key}`);
                    }
                }
            }

            if (schema.query) {
                for (const key in schema.query) {
                    if (!(key in req.query)) {
                        throw ApiError.badRequest(`Missing required query: ${key}`);
                    }
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

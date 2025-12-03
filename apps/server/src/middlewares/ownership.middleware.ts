import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const requireOwnership = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (id !== userId) {
            throw ApiError.forbidden('You can only modify your own resources');
        }

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
};

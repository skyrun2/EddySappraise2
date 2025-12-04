import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                throw ApiError.unauthorized('Authentication required');
            }

            if (!allowedRoles.includes(userRole)) {
                throw ApiError.forbidden('Insufficient permissions');
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
};

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const ownershipOrAdmin = (resourceIdParam: string = 'id') => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const resourceId = req.params[resourceIdParam];
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId) {
                throw ApiError.unauthorized('Authentication required');
            }

            // Admins and moderators can access any resource
            if (userRole === 'ADMIN' || userRole === 'MODERATOR') {
                return next();
            }

            // Check ownership
            if (resourceId !== userId) {
                throw ApiError.forbidden(
                    'You can only access your own resources'
                );
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

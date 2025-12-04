import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require specific roles
 * @param roles - Array of allowed roles (e.g., ['ADMIN', 'USER'])
 */
export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to require ownership or admin role
 * Checks if the authenticated user is either the owner of the resource or an admin
 * @param paramName - Name of the route parameter containing the user ID (default: 'id')
 */
export const requireOwnership = (paramName: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const resourceUserId = req.params[paramName];
        const authenticatedUserId = req.user.id;
        const userRole = req.user.role;

        // Allow if user is admin or owns the resource
        if (userRole === 'ADMIN' || authenticatedUserId === resourceUserId) {
            next();
            return;
        }

        res.status(403).json({
            success: false,
            message: 'You can only modify your own resources',
        });
    };
};

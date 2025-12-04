import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const requireKyc = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
            return;
        }

        // Fetch fresh user data from DB (don't trust token)
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { isKycApproved: true },
        });

        if (!user?.isKycApproved) {
            res.status(403).json({
                success: false,
                error: 'KYC verification required',
                message:
                    'Please complete KYC verification to create listings or place orders',
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

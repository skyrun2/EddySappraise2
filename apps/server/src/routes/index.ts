import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import protectedRoutes from './protected.routes';
import listingRoutes from './listing.routes';
import orderRoutes from './order.routes';
import uploadRoutes from './upload.routes';
import kycRoutes from './kyc.routes';
import walletRoutes from './wallet.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);
router.use('/listings', listingRoutes);
router.use('/orders', orderRoutes);
router.use('/uploads', uploadRoutes);
router.use('/kyc', kycRoutes);
router.use('/wallet', walletRoutes);

export default router;

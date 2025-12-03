import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import protectedRoutes from './protected.routes';

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

export default router;

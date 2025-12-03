import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';

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

export default router;

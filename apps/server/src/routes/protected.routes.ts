import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/protected/me - Get authenticated user info
router.get('/me', authMiddleware, (req: Request, res: Response) => {
    // req.user is set by authMiddleware
    res.status(200).json({
        success: true,
        message: 'Authenticated user info',
        data: {
            user: req.user,
        },
    });
});

export default router;

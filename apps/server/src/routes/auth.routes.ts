import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import { validate } from '../middlewares/validate';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

// POST /api/auth/register - Register new user
router.post(
    '/register',
    validate({
        body: { username: 'string', email: 'string', password: 'string' },
    }),
    register
);

// POST /api/auth/login - Login user
router.post(
    '/login',
    validate({
        body: { email: 'string', password: 'string' },
    }),
    login
);

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, getMe);

export default router;

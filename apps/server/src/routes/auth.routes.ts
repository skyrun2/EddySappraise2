import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';

const router = Router();

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

export default router;

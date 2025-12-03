import { Router } from 'express';
import {
    getAllUsers,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOwnership } from '../middlewares/ownership.middleware';

const router = Router();

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:username - Get user by username
router.get('/:username', getUserByUsername);

// POST /api/users - Create new user
router.post(
    '/',
    validate({
        body: { username: 'string', email: 'string', password: 'string' },
    }),
    createUser
);

// PUT /api/users/:id - Update user (protected)
router.put('/:id', authMiddleware, requireOwnership, updateUser);

// DELETE /api/users/:id - Delete user (protected)
router.delete('/:id', authMiddleware, requireOwnership, deleteUser);

export default router;

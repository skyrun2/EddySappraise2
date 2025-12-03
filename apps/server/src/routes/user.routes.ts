import { Router } from 'express';
import {
    getAllUsers,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/user.controller';
import { validate } from '../middlewares/validate';

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

// PUT /api/users/:username - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:username - Delete user
router.delete('/:id', deleteUser);

export default router;

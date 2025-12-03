import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { signJwt } from '../utils/jwt.util';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcrypt';

export const register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'Username, email, and password are required',
            });
            return;
        }

        const user = await userService.createUser({ username, email, password });

        const token = signJwt({
            userId: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token,
            },
        });
    }
);

export const login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
            return;
        }

        // Find user by email (need to get full user with password)
        const user = await userService.getUserByEmail(email);

        if (!user) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        // Generate token
        const token = signJwt({
            userId: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });

        // Return user without password
        const { password: _, ...safeUser } = user;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: safeUser,
                token,
            },
        });
    }
);

export const getMe = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            throw ApiError.unauthorized('Authentication required');
        }

        const user = await userService.getUserById(userId);
        const { password: _, ...safeUser } = user;

        res.status(200).json({
            success: true,
            data: safeUser,
        });
    }
);

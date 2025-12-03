import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllUsers = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            data: users,
            count: users.length,
        });
    }
);

export const getUserByUsername = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { username } = req.params;
        if (!username) {
            res.status(400).json({
                success: false,
                message: 'Username is required',
            });
        }
        else {
            const user = await userService.getUserByUsername(username);

            res.status(200).json({
                success: true,
                data: user,
            });
        }
    }
);

export const createUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { username, email, password } = req.body;
        const user = await userService.createUser({ username, email, password });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
        });
    }
);

export const updateUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'User id is required',
            });
        }
        else {
            const { email, password, username } = req.body;
            const user = await userService.updateUser(id, { email, password, username });

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user,
            });
        }
    }
);

export const deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'User id is required',
            });
        }
        else {
            await userService.deleteUser(id);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        }
    }
);

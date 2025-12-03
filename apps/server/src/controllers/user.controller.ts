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

export const getUserById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }
        else {
            const user = await userService.getUserById(id);

            res.status(200).json({
                success: true,
                data: user,
            });
        }
    }
);

export const createUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;
        const user = await userService.createUser({ email, password });

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
                message: 'User ID is required',
            });
        }
        else {
            const { email, password } = req.body;
            const user = await userService.updateUser(id, { email, password });

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
                message: 'User ID is required',
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

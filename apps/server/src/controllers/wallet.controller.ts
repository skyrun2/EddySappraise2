import { Request, Response } from 'express';
import { walletService } from '../services/wallet.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getMyWallet = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            throw ApiError.unauthorized('Authentication required');
        }

        const wallet = await walletService.getWalletByUserId(userId);

        res.status(200).json({
            success: true,
            data: wallet,
        });
    }
);

export const getMyTransactions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { limit, offset } = req.query;

        if (!userId) {
            throw ApiError.unauthorized('Authentication required');
        }

        const result = await walletService.getTransactionHistory(
            userId,
            limit ? parseInt(limit as string) : undefined,
            offset ? parseInt(offset as string) : undefined
        );

        res.status(200).json({
            success: true,
            data: result.transactions,
            total: result.total,
        });
    }
);

export const addFunds = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const adminId = req.user?.id;
        const { userId, amount } = req.body;

        if (!adminId) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (!userId || !amount) {
            throw ApiError.badRequest('User ID and amount are required');
        }
        if (typeof amount !== 'number') {
            throw ApiError.badRequest('Amount must be a number');
        }

        if (amount <= 0) {
            throw ApiError.badRequest('Amount must be a positive number');
        }

        const transaction = await walletService.addFunds(userId, amount, adminId);

        res.status(200).json({
            success: true,
            message: 'Funds added successfully',
            data: transaction,
        });
    }
);

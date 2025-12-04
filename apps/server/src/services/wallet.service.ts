import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Wallet, Transaction } from '@prisma/client';

export class WalletService {
    /**
     * Create wallet for a user
     */
    async createWallet(userId: string): Promise<Wallet> {
        // Check if wallet already exists
        const existing = await prisma.wallet.findUnique({
            where: { userId },
        });

        if (existing) {
            return existing;
        }

        return await prisma.wallet.create({
            data: {
                userId,
                balance: 0,
            },
        });
    }

    /**
     * Get wallet by user ID
     */
    async getWalletByUserId(userId: string): Promise<Wallet> {
        let wallet = await prisma.wallet.findUnique({
            where: { userId },
        });

        // Auto-create wallet if it doesn't exist
        if (!wallet) {
            wallet = await this.createWallet(userId);
        }

        return wallet;
    }

    /**
     * Get wallet balance
     */
    async getBalance(userId: string): Promise<number> {
        const wallet = await this.getWalletByUserId(userId);
        return wallet.balance;
    }

    /**
     * Add funds to wallet (admin/dev only)
     */
    async addFunds(
        userId: string,
        amount: number,
        adminId: string
    ): Promise<Transaction> {
        if (amount <= 0) {
            throw ApiError.badRequest('Amount must be positive');
        }

        const wallet = await this.getWalletByUserId(userId);

        return await prisma.$transaction(async (tx) => {
            // Create transaction record
            const transaction = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'deposit',
                    amount,
                    currency: 'usd',
                    status: 'completed',
                    metadata: { addedBy: adminId },
                },
            });

            // Update wallet balance
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } },
            });

            return transaction;
        });
    }

    /**
     * Get transaction history
     */
    async getTransactionHistory(
        userId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<{ transactions: Transaction[]; total: number }> {
        const wallet = await this.getWalletByUserId(userId);

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: { walletId: wallet.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.transaction.count({ where: { walletId: wallet.id } }),
        ]);

        return { transactions, total };
    }
}

export const walletService = new WalletService();

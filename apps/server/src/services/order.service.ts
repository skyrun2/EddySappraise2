import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Order } from '@prisma/client';
import { walletService } from './wallet.service';

export class OrderService {
    /**
     * Create order with escrow hold
     */
    async createOrderWithEscrow(data: {
        buyerId: string;
        listingId: string;
    }): Promise<Order> {
        // Get listing to check if it exists and is available
        const listing = await prisma.listing.findUnique({
            where: { id: data.listingId },
        });

        if (!listing) {
            throw ApiError.notFound('Listing not found');
        }

        if (listing.status !== 'ACTIVE') {
            throw ApiError.badRequest('Listing is not available for purchase');
        }

        // Prevent buying own listing
        if (listing.sellerId === data.buyerId) {
            throw ApiError.badRequest('You cannot buy your own listing');
        }

        // Get buyer wallet
        const buyerWallet = await walletService.getWalletByUserId(data.buyerId);

        // Check sufficient funds
        if (buyerWallet.balance < listing.price) {
            throw ApiError.badRequest(
                `Insufficient funds. Required: ${listing.price} cents, Available: ${buyerWallet.balance} cents`
            );
        }

        // Create order and hold funds in escrow atomically
        return await prisma.$transaction(async (tx) => {
            // Create order
            const order = await tx.order.create({
                data: {
                    buyerId: data.buyerId,
                    listingId: data.listingId,
                    price: listing.price,
                    status: 'pending',
                },
            });

            // Hold funds in escrow
            const escrowTxn = await tx.transaction.create({
                data: {
                    walletId: buyerWallet.id,
                    type: 'escrow_hold',
                    amount: -listing.price,
                    currency: 'usd',
                    reference: `order-${order.id}`,
                    status: 'completed',
                    metadata: {
                        orderId: order.id,
                        listingId: listing.id,
                    },
                },
            });

            // Update wallet balance
            await tx.wallet.update({
                where: { id: buyerWallet.id },
                data: { balance: { decrement: listing.price } },
            });

            // Update order with escrow reference and status
            return await tx.order.update({
                where: { id: order.id },
                data: {
                    status: 'held',
                    escrowTxnId: escrowTxn.id,
                },
                include: {
                    listing: {
                        include: {
                            seller: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    buyer: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Confirm delivery and release funds to seller
     */
    async confirmDelivery(orderId: string, buyerId: string): Promise<Order> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { listing: true },
        });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        // Validate buyer ownership
        if (order.buyerId !== buyerId) {
            throw ApiError.forbidden('You can only confirm your own orders');
        }

        if (order.status !== 'held') {
            throw ApiError.badRequest(
                `Order cannot be confirmed. Current status: ${order.status}`
            );
        }

        // Get seller wallet
        const sellerWallet = await walletService.getWalletByUserId(
            order.listing.sellerId
        );

        // Release funds to seller atomically
        return await prisma.$transaction(async (tx) => {
            // Create release transaction
            await tx.transaction.create({
                data: {
                    walletId: sellerWallet.id,
                    type: 'release',
                    amount: order.price,
                    currency: 'usd',
                    reference: `order-${order.id}-release`,
                    status: 'completed',
                    metadata: {
                        orderId: order.id,
                        fromBuyer: buyerId,
                    },
                },
            });

            // Update seller wallet
            await tx.wallet.update({
                where: { id: sellerWallet.id },
                data: { balance: { increment: order.price } },
            });

            // Update order status
            return await tx.order.update({
                where: { id: orderId },
                data: { status: 'completed' },
                include: {
                    listing: true,
                    buyer: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Cancel order and refund buyer
     */
    async cancelOrder(orderId: string, buyerId: string): Promise<Order> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        // Validate buyer ownership
        if (order.buyerId !== buyerId) {
            throw ApiError.forbidden('You can only cancel your own orders');
        }

        if (order.status === 'completed') {
            throw ApiError.badRequest('Cannot cancel a completed order');
        }

        if (order.status === 'cancelled') {
            throw ApiError.badRequest('Order is already cancelled');
        }

        // If order is held, refund the buyer
        if (order.status === 'held') {
            const buyerWallet = await walletService.getWalletByUserId(buyerId);

            return await prisma.$transaction(async (tx) => {
                // Create refund transaction
                await tx.transaction.create({
                    data: {
                        walletId: buyerWallet.id,
                        type: 'refund',
                        amount: order.price,
                        currency: 'usd',
                        reference: `order-${order.id}-refund`,
                        status: 'completed',
                        metadata: {
                            orderId: order.id,
                        },
                    },
                });

                // Update buyer wallet
                await tx.wallet.update({
                    where: { id: buyerWallet.id },
                    data: { balance: { increment: order.price } },
                });

                // Update order status
                return await tx.order.update({
                    where: { id: orderId },
                    data: { status: 'cancelled' },
                    include: {
                        listing: true,
                        buyer: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                });
            });
        }

        // If order is pending, just cancel it
        return await prisma.order.update({
            where: { id: orderId },
            data: { status: 'cancelled' },
            include: {
                listing: true,
                buyer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
        return await prisma.order.findMany({
            where: { buyerId },
            include: {
                listing: {
                    include: {
                        seller: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getOrderById(id: string, buyerId: string): Promise<Order> {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                listing: {
                    include: {
                        seller: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        // Only the buyer can view their order
        if (order.buyerId !== buyerId) {
            throw ApiError.forbidden('You can only view your own orders');
        }

        return order;
    }
}

export const orderService = new OrderService();

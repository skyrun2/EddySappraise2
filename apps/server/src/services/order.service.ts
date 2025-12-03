import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Order } from '@prisma/client';

export class OrderService {
    async createOrder(data: { buyerId: string; listingId: string }): Promise<Order> {
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

        return await prisma.order.create({
            data: {
                buyerId: data.buyerId,
                listingId: data.listingId,
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

    async cancelOrder(id: string, buyerId: string): Promise<Order> {
        const order = await this.getOrderById(id, buyerId);

        if (order.status === 'COMPLETED') {
            throw ApiError.badRequest('Cannot cancel a completed order');
        }

        if (order.status === 'CANCELLED') {
            throw ApiError.badRequest('Order is already cancelled');
        }

        return await prisma.order.update({
            where: { id },
            data: { status: 'CANCELLED' },
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
}

export const orderService = new OrderService();

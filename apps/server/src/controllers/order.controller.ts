import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const createOrder = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { listingId } = req.body;
        const buyerId = req.user?.id;

        if (!buyerId) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (!listingId) {
            res.status(400).json({
                success: false,
                error: 'Listing ID is required',
            });
            return;
        }

        const order = await orderService.createOrder({ buyerId, listingId });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order,
        });
    }
);

export const getMyOrders = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const buyerId = req.user?.id;

        if (!buyerId) {
            throw ApiError.unauthorized('Authentication required');
        }

        const orders = await orderService.getOrdersByBuyer(buyerId);

        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length,
        });
    }
);

export const getOrderById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const buyerId = req.user?.id;

        if (!buyerId) {
            throw ApiError.unauthorized('Authentication required');
        }
        if (!id) {
            throw ApiError.badRequest('Order ID is required');
        }
        const order = await orderService.getOrderById(id, buyerId);

        res.status(200).json({
            success: true,
            data: order,
        });
    }
);

export const cancelOrder = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const buyerId = req.user?.id;

        if (!buyerId) {
            throw ApiError.unauthorized('Authentication required');
        }
        if (!id) {
            throw ApiError.badRequest('Order ID is required');
        }
        const order = await orderService.cancelOrder(id, buyerId);

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order,
        });
    }
);

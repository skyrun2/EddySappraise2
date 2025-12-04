import { Router } from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    confirmDelivery,
    cancelOrder,
} from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireKyc } from '../middlewares/requireKyc.middleware';

const router = Router();

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders - Create order (requires KYC)
router.post('/', requireKyc, createOrder);

// GET /api/orders - Get my orders
router.get('/', getMyOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// POST /api/orders/:id/confirm-delivery - Confirm delivery and release funds
router.post('/:id/confirm-delivery', confirmDelivery);

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', cancelOrder);

export default router;

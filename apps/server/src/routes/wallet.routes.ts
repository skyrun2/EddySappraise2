import { Router } from 'express';
import {
    getMyWallet,
    getMyTransactions,
    addFunds,
} from '../controllers/wallet.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// All wallet routes require authentication
router.use(authMiddleware);

// User routes
router.get('/me', getMyWallet);
router.get('/transactions', getMyTransactions);

// Admin routes
router.post('/add-funds', requireRole('ADMIN'), addFunds);

export default router;

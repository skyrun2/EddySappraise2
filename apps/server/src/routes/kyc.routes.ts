import { Router } from 'express';
import {
    submitKYC,
    getMyKYC,
    getAllKYCSubmissions,
    approveKYC,
    rejectKYC,
} from '../controllers/kyc.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// All KYC routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', submitKYC);
router.get('/me', getMyKYC);

// Admin routes
router.get(
    '/admin/all',
    requireRole('ADMIN', 'MODERATOR'),
    getAllKYCSubmissions
);
router.post('/admin/:id/approve', requireRole('ADMIN', 'MODERATOR'), approveKYC);
router.post('/admin/:id/reject', requireRole('ADMIN', 'MODERATOR'), rejectKYC);

export default router;

import { Router } from 'express';
import { getPresignedUrl } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All upload routes require authentication
router.use(authMiddleware);

// GET /api/uploads/presign - Generate presigned URL
router.get('/presign', getPresignedUrl);

export default router;

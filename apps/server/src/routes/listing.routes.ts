import { Router } from 'express';
import {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing,
} from '../controllers/listing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/listings - Get all listings (public)
router.get('/', getAllListings);

// GET /api/listings/:id - Get listing by ID (public)
router.get('/:id', getListingById);

// POST /api/listings - Create listing (protected)
router.post('/', authMiddleware, createListing);

// PUT /api/listings/:id - Update listing (protected, owner only)
router.put('/:id', authMiddleware, updateListing);

// DELETE /api/listings/:id - Delete listing (protected, owner only)
router.delete('/:id', authMiddleware, deleteListing);

export default router;

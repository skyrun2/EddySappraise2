import { Request, Response } from 'express';
import { listingService } from '../services/listing.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const createListing = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { title, description, price, condition, category, images } = req.body;
        const sellerId = req.user?.id;

        if (!sellerId) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (!title || !price || !images) {
            console.log({ title, price, images });

            res.status(400).json({
                success: false,
                error: 'Title, price, and images are required',
            });
            return;
        }

        const listing = await listingService.createListing({
            title,
            description,
            price: parseInt(price),
            condition,
            category,
            images,
            sellerId,
        });

        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: listing,
        });
    }
);

export const getAllListings = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { status } = req.query;
        const filters = status ? { status: status as string } : undefined;

        const listings = await listingService.getAllListings(filters);

        res.status(200).json({
            success: true,
            data: listings,
            count: listings.length,
        });
    }
);

export const getListingById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        if (!id) {
            throw ApiError.badRequest('Listing ID is required');
        }

        const listing = await listingService.getListingById(id);

        res.status(200).json({
            success: true,
            data: listing,
        });
    }
);

export const updateListing = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { title, description, price, status } = req.body;
        const sellerId = req.user?.id;

        if (!sellerId) {
            throw ApiError.unauthorized('Authentication required');
        }
        if (!id) {
            throw ApiError.badRequest('Listing ID is required');
        }
        const listing = await listingService.updateListing(id, sellerId, {
            title,
            description,
            price: price ? parseFloat(price) : undefined,
            status,
        });

        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: listing,
        });
    }
);

export const deleteListing = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const sellerId = req.user?.id;

        if (!sellerId) {
            throw ApiError.unauthorized('Authentication required');
        }
        if (!id) {
            throw ApiError.badRequest('Listing ID is required');
        }
        await listingService.deleteListing(id, sellerId);

        res.status(200).json({
            success: true,
            message: 'Listing deleted successfully',
        });
    }
);

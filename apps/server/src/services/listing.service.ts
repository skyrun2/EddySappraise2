import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Listing } from '@prisma/client';
import { storageService } from './storage.service';

export class ListingService {
    /**
     * Validate listing data
     */
    private validateListingData(data: {
        images?: string[];
        price?: number;
    }): void {
        // Validate images
        if (data.images) {
            if (data.images.length === 0) {
                throw ApiError.badRequest('At least one image is required');
            }

            if (data.images.length > 8) {
                throw ApiError.badRequest('Maximum 8 images allowed');
            }

            // Validate image URLs
            data.images.forEach((url) => {
                if (!storageService.validateImageUrl(url)) {
                    throw ApiError.badRequest(
                        'Invalid image URL. Images must be uploaded to our storage.'
                    );
                }
            });
        }

        // Validate price
        if (data.price !== undefined) {
            if (typeof data.price !== 'number' || data.price <= 0) {
                throw ApiError.badRequest(
                    'Price must be a positive number in cents'
                );
            }
        }
    }

    async createListing(data: {
        title: string;
        description?: string;
        price: number;
        condition?: string;
        category?: string;
        images: string[];
        sellerId: string;
    }): Promise<Listing> {
        // Validate listing data
        this.validateListingData({ images: data.images, price: data.price });

        return await prisma.listing.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                condition: data.condition,
                category: data.category,
                images: data.images,
                sellerId: data.sellerId,
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getAllListings(filters?: { status?: string }): Promise<Listing[]> {
        const where = filters?.status ? { status: filters.status } : {};

        return await prisma.listing.findMany({
            where,
            include: {
                seller: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getListingById(id: string): Promise<Listing> {
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });

        if (!listing) {
            throw ApiError.notFound(`Listing with ID ${id} not found`);
        }

        return listing;
    }

    async updateListing(
        id: string,
        sellerId: string,
        data: {
            title?: string;
            description?: string;
            price?: number;
            condition?: string;
            category?: string;
            images?: string[];
            status?: string;
        }
    ): Promise<Listing> {
        const listing = await this.getListingById(id);

        if (listing.sellerId !== sellerId) {
            throw ApiError.forbidden('You can only update your own listings');
        }

        // Validate if images or price are being updated
        if (data.images || data.price) {
            this.validateListingData({
                images: data.images,
                price: data.price,
            });
        }

        return await prisma.listing.update({
            where: { id },
            data,
            include: {
                seller: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }

    async deleteListing(id: string, sellerId: string): Promise<void> {
        const listing = await this.getListingById(id);

        if (listing.sellerId !== sellerId) {
            throw ApiError.forbidden('You can only delete your own listings');
        }

        await prisma.listing.delete({
            where: { id },
        });
    }

    async getListingsBySeller(sellerId: string): Promise<Listing[]> {
        return await prisma.listing.findMany({
            where: { sellerId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}

export const listingService = new ListingService();

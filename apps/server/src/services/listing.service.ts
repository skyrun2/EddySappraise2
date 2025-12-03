import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Listing } from '@prisma/client';

export class ListingService {
    async createListing(data: {
        title: string;
        description?: string;
        price: number;
        sellerId: string;
    }): Promise<Listing> {
        return await prisma.listing.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
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
        return await prisma.listing.findMany({
            where: filters,
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
        data: { title?: string; description?: string; price?: number; status?: string }
    ): Promise<Listing> {
        const listing = await this.getListingById(id);

        if (listing.sellerId !== sellerId) {
            throw ApiError.forbidden('You can only update your own listings');
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

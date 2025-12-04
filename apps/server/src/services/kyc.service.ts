import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { KYC } from '@prisma/client';

export class KYCService {
    /**
     * Submit KYC for verification
     */
    async submitKYC(data: {
        userId: string;
        fullName: string;
        currentSchool?: string;
        location: string;
        docUrl: string;
        selfieUrl: string;
    }): Promise<KYC> {
        // Check if user already has KYC submission
        const existing = await prisma.kYC.findUnique({
            where: { userId: data.userId },
        });

        if (existing) {
            throw ApiError.conflict('KYC already submitted. Please wait for review.');
        }

        // Create KYC submission
        return await prisma.kYC.create({
            data: {
                userId: data.userId,
                fullName: data.fullName,
                currentSchool: data.currentSchool,
                location: data.location,
                docUrl: data.docUrl,
                selfieUrl: data.selfieUrl,
                verificationStatus: 'pending',
            },
        });
    }

    /**
     * Get KYC status for a user
     */
    async getKYCByUserId(userId: string): Promise<KYC | null> {
        return await prisma.kYC.findUnique({
            where: { userId },
        });
    }

    /**
     * Get all KYC submissions (admin)
     */
    async getAllKYCSubmissions(filters?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ kycs: KYC[]; total: number }> {
        const where = filters?.status
            ? { verificationStatus: filters.status }
            : {};

        const [kycs, total] = await Promise.all([
            prisma.kYC.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: { submittedAt: 'desc' },
                take: filters?.limit || 50,
                skip: filters?.offset || 0,
            }),
            prisma.kYC.count({ where }),
        ]);

        return { kycs, total };
    }

    /**
     * Approve KYC
     */
    async approveKYC(kycId: string, reviewerId: string): Promise<KYC> {
        const kyc = await prisma.kYC.findUnique({
            where: { id: kycId },
        });

        if (!kyc) {
            throw ApiError.notFound('KYC submission not found');
        }

        if (kyc.verificationStatus === 'approved') {
            throw ApiError.badRequest('KYC already approved');
        }

        // Update KYC and user in transaction
        return await prisma.$transaction(async (tx) => {
            // Update KYC status
            const updatedKYC = await tx.kYC.update({
                where: { id: kycId },
                data: {
                    verificationStatus: 'approved',
                    reviewedAt: new Date(),
                    reviewerId,
                },
            });

            // Update user's isKycApproved
            await tx.user.update({
                where: { id: kyc.userId },
                data: { isKycApproved: true },
            });

            return updatedKYC;
        });
    }

    /**
     * Reject KYC
     */
    async rejectKYC(
        kycId: string,
        reviewerId: string,
        reason?: string
    ): Promise<KYC> {
        const kyc = await prisma.kYC.findUnique({
            where: { id: kycId },
        });

        if (!kyc) {
            throw ApiError.notFound('KYC submission not found');
        }

        return await prisma.kYC.update({
            where: { id: kycId },
            data: {
                verificationStatus: 'rejected',
                reviewedAt: new Date(),
                reviewerId,
                rejectionReason: reason,
            },
        });
    }
}

export const kycService = new KYCService();

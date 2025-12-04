import { Request, Response } from 'express';
import { kycService } from '../services/kyc.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const submitKYC = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            throw ApiError.unauthorized('Authentication required');
        }

        const { fullName, currentSchool, location, docUrl, selfieUrl } = req.body;

        //Omo later things guy
        // if (!fullName || !location || !docUrl || !selfieUrl) {
        //     throw ApiError.badRequest(
        //         'Full name, location, document URL, and selfie URL are required'
        //     );
        // }

        // the this side first 
        if (!fullName || !location) {
            throw ApiError.badRequest(
                'Full name and location are required'
            );
        }

        const kyc = await kycService.submitKYC({
            userId,
            fullName,
            currentSchool,
            location,
            docUrl,
            selfieUrl,
        });

        res.status(201).json({
            success: true,
            message: 'KYC submitted successfully. Please wait for admin review.',
            data: kyc,
        });
    }
);

export const getMyKYC = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            throw ApiError.unauthorized('Authentication required');
        }

        const kyc = await kycService.getKYCByUserId(userId);

        if (!kyc) {
            res.status(404).json({
                success: false,
                message: 'No KYC submission found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: kyc,
        });
    }
);

export const getAllKYCSubmissions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { status, limit, offset } = req.query;

        const result = await kycService.getAllKYCSubmissions({
            status: status as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined,
        });

        res.status(200).json({
            success: true,
            data: result.kycs,
            total: result.total,
        });
    }
);

export const approveKYC = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const reviewerId = req.user?.id;

        if (!reviewerId) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (!id) {
            throw ApiError.badRequest('KYC ID is required');
        }

        const kyc = await kycService.approveKYC(id, reviewerId);

        res.status(200).json({
            success: true,
            message: 'KYC approved successfully',
            data: kyc,
        });
    }
);

export const rejectKYC = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const reviewerId = req.user?.id;
        const { reason } = req.body;

        if (!reviewerId) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (!id) {
            throw ApiError.badRequest('KYC ID is required');
        }

        const kyc = await kycService.rejectKYC(id, reviewerId, reason);

        res.status(200).json({
            success: true,
            message: 'KYC rejected',
            data: kyc,
        });
    }
);

import { Request, Response } from 'express';
import { storageService } from '../services/storage.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getPresignedUrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const { filename, contentType, folder } = req.query;

        if (!filename || typeof filename !== 'string') {
            throw ApiError.badRequest('Filename is required');
        }

        if (!contentType || typeof contentType !== 'string') {
            throw ApiError.badRequest('Content type is required');
        }

        // Validate content type
        if (!contentType.startsWith('image/')) {
            throw ApiError.badRequest('Only image files are allowed');
        }

        const folderName = typeof folder === 'string' ? folder : 'general';

        const urls = await storageService.generatePresignedUrl(
            filename,
            contentType,
            folderName
        );

        res.status(200).json({
            success: true,
            data: urls,
        });
    }
);

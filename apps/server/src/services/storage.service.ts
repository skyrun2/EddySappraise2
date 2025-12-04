import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const bucketName = process.env.SUPABASE_BUCKET || 'marketplace-uploads';

let supabase: SupabaseClient;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('Supabase credentials not configured. Upload functionality will be disabled.');
}

export class StorageService {
    /**
     * Generate a presigned URL for uploading a file
     */
    async generatePresignedUrl(
        filename: string,
        contentType: string,
        folder: string = 'general'
    ): Promise<{ uploadUrl: string; publicUrl: string }> {
        if (!supabase) {
            throw new Error('Supabase not configured');
        }

        // Validate content type (images only)
        if (!contentType.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${folder}/${timestamp}-${sanitizedFilename}`;

        // Create a signed upload URL (valid for 15 minutes)
        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUploadUrl(filePath);

        if (error) {
            throw new Error(`Failed to generate presigned URL: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return {
            uploadUrl: data.signedUrl,
            publicUrl: publicUrlData.publicUrl,
        };
    }

    /**
     * Validate if a URL belongs to our Supabase storage
     */
    validateImageUrl(url: string): boolean {
        if (!supabaseUrl) return false;
        return url.startsWith(supabaseUrl);
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(fileUrl: string): Promise<void> {
        if (!supabase) {
            throw new Error('Supabase not configured');
        }

        // Extract file path from URL
        const urlParts = fileUrl.split(`${bucketName}/`);
        if (urlParts.length < 2) {
            throw new Error('Invalid file URL');
        }

        const filePath = urlParts[1];

        if (!filePath) {
            throw new Error('Invalid file path');
        }
        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
}

export const storageService = new StorageService();

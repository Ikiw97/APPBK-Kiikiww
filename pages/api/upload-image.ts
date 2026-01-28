import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Allow larger uploads for images
        },
    },
};

interface UploadResponse {
    success: boolean;
    url?: string;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UploadResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
            console.error('IMGBB_API_KEY not configured');
            return res.status(500).json({ success: false, error: 'Image upload service not configured' });
        }

        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

        // Create form data for imgBB API
        const formData = new FormData();
        formData.append('key', apiKey);
        formData.append('image', base64Image);

        // Upload to imgBB
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!result.success) {
            console.error('imgBB upload failed:', result);
            return res.status(500).json({
                success: false,
                error: result.error?.message || 'Failed to upload image'
            });
        }

        // Return the display URL
        return res.status(200).json({
            success: true,
            url: result.data.display_url,
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error while uploading image'
        });
    }
}

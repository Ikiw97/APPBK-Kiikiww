import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Basic check for API key
        if (!process.env.IMGBB_API_KEY) {
            console.error('IMGBB_API_KEY is missing');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // We need to parse the body using a library probably, or just forward it?
        // Next.js body parser gives us JSON or string usually.
        // Ideally we use FormData on client, so we need to parse multipart/form-data here.
        // But to keep it simple without extra libs like formidable (if not installed),
        // we can interpret the body if sent as base64 JSON, OR use formidable.

        // Let's assume the client sends a JSON body with { image: "base64String" } for simplicity 
        // and compatibility with direct API calls, avoiding complex multipart parsing without middleware.

        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        // Determine if it's base64 (remove prefix if present)
        const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

        const params = new URLSearchParams();
        params.append('key', process.env.IMGBB_API_KEY as string);
        params.append('image', base64Image);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: params,
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'Failed to upload to ImgBB');
        }

        return res.status(200).json({
            success: true,
            url: data.data.url,
            delete_url: data.data.delete_url
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
}

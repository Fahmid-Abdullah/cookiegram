// Import necessary modules
import { connectToDB } from '@/app/lib/mongoose';
import Post from '@/app/lib/models/post.model';
import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/app/lib/middleware';

// Define the handler function for the POST request
const handler = async (req: NextRequest): Promise<NextResponse> => {
    await connectToDB();

    try {
        // Parse the request body to get post IDs
        const { postIds } = await req.json();

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json({ error: 'No post IDs provided' }, { status: 400 });
        }

        // Fetch posts matching the given post IDs
        const posts = await Post.find({ _id: { $in: postIds } }).exec();

        // Map to an array of objects with postId, imageLink, and created_at
        const images = posts.map(post => ({
            postId: post._id.toString(),
            imageLink: post.imageLink,
            created_at: post.created_at
        }));

        return NextResponse.json(images, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching images:', error);
        return NextResponse.json({ error: `Failed to get images: ${error.message}` }, { status: 500 });
    }
};

// Export the handler for the POST method
export const POST = validateToken(handler);

import { connectToDB } from '@/app/lib/mongoose';
import Post from '@/app/lib/models/post.model';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    await connectToDB();

    try {
        // Parse the request body to get post IDs
        const { postIds } = await request.json();

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json({ error: 'No post IDs provided' }, { status: 400 });
        }

        // Fetch posts matching the given post IDs
        const posts = await Post.find({ _id: { $in: postIds } }).exec();

        // Map to an array of objects with postId and imageLink
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
}

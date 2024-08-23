// Import necessary modules
import { getPost } from '@/app/lib/actions/post.actions';
import { validateToken } from '@/app/lib/middleware';
import User from '@/app/lib/models/user.model';
import { connectToDB } from '@/app/lib/mongoose';
import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Define the handler function for the GET request
const handler = async (req: NextRequest): Promise<NextResponse> => {
    await connectToDB();

    try {
        const authUser = await currentUser();
        if (!authUser) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const url = new URL(req.url);
        const postId = url.searchParams.get('postId');

        if (postId) {
            const post = await getPost(postId);
            const postUser = await User.findById(post.userId);

            // Fetch user details from Clerk
            const clerkUser = await clerkClient.users.getUser(postUser.clerkUserId);

            // Return the post object with the creator's name and image
            return NextResponse.json({
                post: {
                    ...post,
                    clerkUserId: clerkUser.id,
                    creator: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    image: clerkUser.imageUrl
                }
            });
        }

        return NextResponse.json({ error: 'Post ID not provided' }, { status: 400 });
    } catch (error: any) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: `Failed to fetch posts: ${error.message}` }, { status: 500 });
    }
};

// Export the handler for the GET method
export const GET = validateToken(handler);

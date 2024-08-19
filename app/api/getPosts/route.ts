import { createUser } from '@/app/lib/actions/user.actions';
import Post from '@/app/lib/models/post.model';
import User from '@/app/lib/models/user.model';
import { connectToDB } from '@/app/lib/mongoose';
import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    await connectToDB();

    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        await createUser(user.id);

        // Find all posts
        const posts = await Post.find().exec();
        
        // Retrieve user details for each post
        const postsWithUserDetails = await Promise.all(posts.map(async (post) => {
            const user = await User.findById(post.userId).exec();
            if (!user) {
                throw new Error('User not found');
            }

            // Fetch user details from Clerk
            const clerkUser = await clerkClient.users.getUser(user.clerkUserId);

            // Add creator name to the post object
            return {
                ...post.toObject(),
                clerkId: `${clerkUser.id}`,
                creator: `${clerkUser.firstName} ${clerkUser.lastName}`,
                image: `${clerkUser.imageUrl}`
            };
        }));

        return NextResponse.json(postsWithUserDetails, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: `Failed to fetch posts: ${error.message}` }, { status: 500 });
    }
}

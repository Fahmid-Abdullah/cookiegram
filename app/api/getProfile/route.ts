// Import necessary modules
import { getUser } from '@/app/lib/actions/user.actions';
import { validateToken } from '@/app/lib/middleware';
import User from '@/app/lib/models/user.model';
import { connectToDB } from '@/app/lib/mongoose';
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Define the handler function for the GET request
const handler = async (req: NextRequest): Promise<NextResponse> => {
    await connectToDB();

    const url = new URL(req.url);
    const userId = url.searchParams.get('clerkId');

    try {
        let user;

        if (userId) {
            user = await clerkClient.users.getUser(userId);
            if (!user) {
                return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
            }
        } else {
            return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
        }

        const userData = await getUser(user.id);

        // Fetch following names and clerkIds
        const followingsWithDetails = await Promise.all(
            userData.followings.map(async (followingId: string) => {
                const user = await User.findById(followingId).exec();
                if (!user) {
                    throw new Error(`${followingId} not found`);
                }

                // Fetch user details from Clerk
                const clerkUser = await clerkClient.users.getUser(user.clerkUserId);

                // Return an object with the creator name and Clerk ID
                return {
                    creator: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    image: clerkUser.imageUrl,
                    clerkId: clerkUser.id,
                    userId: user._id,
                };
            })
        );

        const followersWithDetails = await Promise.all(
            userData.followers.map(async (followerId: string) => {
                const user = await User.findById(followerId).exec();
                if (!user) {
                    throw new Error(`${followerId} not found`);
                }

                // Fetch user details from Clerk
                const clerkUser = await clerkClient.users.getUser(user.clerkUserId);

                // Return an object with the creator name and Clerk ID
                return {
                    creator: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    image: clerkUser.imageUrl,
                    clerkId: clerkUser.id,
                    userId: user._id,
                };
            })
        );

        const clerkData = {
            userId: user.id,
            image: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Attach the modified followings and followers arrays to the userData
        const updatedUserData = {
            ...userData.toObject(),
            followings: followingsWithDetails,
            followers: followersWithDetails,
        };

        return NextResponse.json({ clerkData, updatedUserData }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ error: `Failed to fetch user data: ${error.message}` }, { status: 500 });
    }
};

// Export the handler for the GET method
export const GET = validateToken(handler);

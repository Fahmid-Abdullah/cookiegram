"use server"

import { clerkClient } from "@clerk/nextjs/server";
import Post from "../models/post.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface minimalPost {
    _id: string;
    imageLink: string;
    description: string;
    created_at: string;
  }

interface UserData {
    name: string;
    userid: string;
    clerkId: string;
    clerkImage: string;
}

export async function createUser(clerkUserId: string): Promise<void> {
    try {
        const existingUser = await User.findOne( { clerkUserId } );
        if (!existingUser) {
            const newUser = new User( { clerkUserId } );
            await newUser.save();
        }
    } catch (error: any) {
        throw new Error(`Failed to create user :( ${error.message}`)
    }
}

export async function getUser(clerkUserId: string): Promise<any> { 
    try {
        let existingUser = await User.findOne({ clerkUserId });
        if (!existingUser) {
            console.log('User not found. Creating User.');
            await createUser(clerkUserId);
            existingUser = await User.findOne({ clerkUserId });
        }
        return existingUser;
    } catch (error: any) {
        console.error(`Failed to get or create user: ${error.message}`);
        throw new Error(`Failed to get or create user: ${error.message}`);
    }
}


export async function updateDescription(clerkUserId: string, description: string): Promise<void> {
    try {
        const existingUser = await User.findOne({ clerkUserId });
        if (existingUser) {
            existingUser.description = description;
            await existingUser.save();
        } else {
            console.log("User not found :(");
        }
    } catch (error: any) {
        throw new Error(`Failed to update user description :( ${error.message}`);
    }
}

export async function followUser(clerkUserId: string, followId: string, followed: boolean): Promise<void> {
    await connectToDB();
    try {
        const user = await User.findOne( { clerkUserId } );
        const followUser = await User.findOne( { _id: followId } );

        if (!user && !followUser) {
            throw new Error(`Failed to authenticate one or both users :(`)
        }

        if (followed) {
            user.followings.push(followUser);
            followUser.followers.push(user);
            await user.save();
            await followUser.save();
        } else {
            user.followings.pull(followUser);
            followUser.followers.pull(user);
            await user.save();
            await followUser.save();
        }
        
    } catch (error: any) {
        throw new Error(`Failed to follow user: ${error.message}`);
    }
}

export async function getLikedPosts(clerkUserId: string) : Promise<minimalPost[]> {
    await connectToDB();

    try {
        const user = await User.findOne( { clerkUserId } )
        if (!user) {
            throw new Error(`Failed to authenticate user :(`)
        }

        // Find liked posts
        const posts = await Post.find( { likes: user._id } )
        if (!posts) {
            throw new Error(`No liked posts found :(`)
        }

        // Retrieve user details for each post
        const minimalPosts = await Promise.all(posts.map(async (post) => {
            return {
                _id: post._id.toString(),
                imageLink: post.imageLink,
                description: post.description,
                created_at: post.created_at,
            };
        }));

        // Filter out any null posts if any errors occurred
        return minimalPosts.filter(post => post !== null) as minimalPost[];

    } catch (error: any) {
        throw new Error(`Failed to get liked posts: ${error.message}`);
    }
}

export async function getAllUsers(): Promise<UserData[]> {
    await connectToDB();

    try {
        const users = await User.find();
        if (!users || users.length === 0) {
            throw new Error('No users found');
        }

        // Retrieve user details for each user
        const userData = await Promise.all(users.map(async (user) => {
            try {
                const clerkUser = await clerkClient.users.getUser(user.clerkUserId);
                if (!clerkUser) {
                    throw new Error('Clerk user not found');
                }
                
                return {
                    name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    userid: user._id.toString(), // Ensure consistency with UserData interface
                    clerkId: `${clerkUser.id}`,
                    clerkImage: `${clerkUser.imageUrl}` // Ensure consistency with UserData interface
                };
            } catch (error: any) {
                // Log individual user errors
                console.error(`Error fetching clerk user ${user.clerkUserId}: ${error.message}`);
                return null; // Return null for failed users
            }
        }));

        // Filter out any null userData
        return userData.filter(user => user !== null) as UserData[];

    } catch (error: any) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
}

export async function setName(clerkId: string, firstName: string, lastName: string): Promise<void> {
    try {
        const params = { firstName: firstName, lastName: lastName }
        await clerkClient.users.updateUser(clerkId, params)
    } catch (error: any) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
}

export async function updatePfp(clerkId: string, formData: FormData): Promise<void> {
    try {
        const fileEntry = formData.get('file');

        if (fileEntry && fileEntry instanceof File) {
            const response = await clerkClient.users.updateUserProfileImage(clerkId, { file: fileEntry });
        } else {
            throw new Error('Failed to get image or the image is not a valid file.');
        }
        
    } catch (error: any) {
        throw new Error(`Failed to update profile image: ${error.message}`);
    }
}

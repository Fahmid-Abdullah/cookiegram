"use server"
import { connectToDB } from '@/app/lib/mongoose';
import Post from "../models/post.model";
import User from "../models/user.model";
import { createUser } from "./user.actions";
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Function to create a new post
export async function newPost(clerkUserId: string, imageLink: string, description: string, recipe: string): Promise<void> {
    await connectToDB();
    try {
        await createUser(clerkUserId);  // Ensure this function is creating a user if not exists
        const userObject = await User.findOne({ clerkUserId });

        if (userObject) {
            const newPost = new Post({ userId: userObject._id, imageLink, description, recipe });

            // Add post ID to user's posts array
            userObject.posts.push(newPost);

            // Save the user and post
            await userObject.save();
            await newPost.save();

            console.log("Post created successfully :)");
        } else {
            console.log("User not found :(");
        }
    } catch (error: any) {
        throw new Error(`Failed to create post: ${error.message}`);
    }
}

// Function to get a single post
export async function getPost(postId: string): Promise<any> {
    await connectToDB();
    try {
        const post = await Post.findOne({ _id: postId });

        if (post) {
            const plainPost = post.toObject();
            return plainPost;
        } else {
            console.log("Post not found :(");
        }
    } catch (error: any) {
        throw new Error(`Failed to create post: ${error.message}`);
    }
}

// Function to edit an existing post
export async function editPost(postId: string, imageLink: string, description: string, recipe: string): Promise<void> {
    await connectToDB();
    try {
        const existingPost = await Post.findOne({ _id: postId });

        if (existingPost) {
            existingPost.imageLink = imageLink;
            existingPost.description = description;
            existingPost.recipe = recipe;

            await existingPost.save();
            console.log("Post updated successfully :)");
        } else {
            console.log("Post not found :(");
        }
    } catch (error: any) {
        throw new Error(`Failed to create post: ${error.message}`);
    }
}

// Function to delete a post
export async function deletePost(postId: string): Promise<void> {
    await connectToDB();
    try {
        const userObject = await User.findOne( { posts: postId } )

        const existingPost = await Post.deleteOne({ _id: postId });

        if (existingPost.deletedCount === 1) {
            userObject.posts.pull(postId)
            await userObject.save()
            console.log("Post deleted successfully :)");
        } else {
            console.log("Post not found :(");
        }
    } catch (error: any) {
        throw new Error(`Failed to delete post: ${error.message}`);
    }
}

// Function to like or unlike a post
export async function likePost(clerkUserId: string, _id: string, liked: boolean): Promise<void> {
    await connectToDB();
    try {
        const user = await User.findOne( { clerkUserId } );
        const post = await Post.findOne( { _id } );

        if (!user && !post) {
            throw new Error(`Failed to authenticate user or post :(`)
        }

        if (liked) {
            post.likes.push(user);
            await post.save();
            console.log("Post liked successfully :)");
        } else {
            post.likes.pull(user);
            await post.save();
            console.log("Post unliked successfully :)");
        }

    } catch (error: any) {
        throw new Error(`Failed to create post: ${error.message}`);
    }
}

export async function getRecipe(postId: string): Promise<any> {
    await connectToDB();
    try {
        const post = await Post.findOne({ _id: postId });
        const user = await User.findById(post.userId);
        const clerkUser = await clerkClient.users.getUser(user.clerkUserId);

        if (post) {
            return { 
                recipe: post.recipe,
                creator: `${clerkUser.firstName} ${clerkUser.lastName}`
            };
        } else {
            console.log("Post not found :(");
        }
    } catch (error: any) {
        throw new Error(`Failed to create post: ${error.message}`);
    }
}
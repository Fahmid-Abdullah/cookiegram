"use server"
import { clerkClient } from "@clerk/nextjs/server";
import Comment from "../models/comment.model";
import Post from "../models/post.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface CommentFormatted {
    _id: string;
    creator: string;
    image: string;
    clerkId: string;
    content: string;
    created_at: string;
  }

export async function newComment(postId: string, commentUserId: string, content: string): Promise<void> {
    await connectToDB();
    try {
        console.log(commentUserId);
        const userObject = await User.findOne({ _id: commentUserId });
        const post = await Post.findOne({ _id: postId });

        if (!userObject || !post) {
            console.log("User or Post not found :(");
        }

        const newComment = new Comment({ userId: userObject._id, postId, content});
        console.log(newComment)

        // Save the post
        await newComment.save();

        // Add comment to post db
        post.commentIDs.push(newComment);
        await post.save();

        console.log("Comment created successfully :)");

    } catch (error: any) {
        throw new Error(`Failed to create comment: ${error.message}`);
    }
}

export async function getComments(postId: string): Promise<CommentFormatted[]> {
    await connectToDB();

    try {
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            throw new Error(`Post with ID ${postId} not found`);
        }

        if (!post.commentIDs || post.commentIDs.length === 0) {
            return []; // Return an empty array if there are no comments
        }

        // Fetching comments for the post
        const comments = await Promise.all(post.commentIDs.map(async (commentID: any) => {
            try {
                const comment = await Comment.findOne( { _id: commentID } )
                if (!comment) {
                    throw new Error(`Clerk user with ID ${comment._id} not found`);
                }

                const user = await User.findOne({ _id: comment.userId });
                if (!user) {
                    throw new Error(`User with ID ${post.userId} not found`);
                }

                const clerkUser = await clerkClient.users.getUser(user.clerkUserId);
                if (!clerkUser) {
                    throw new Error(`Clerk user with ID ${user.clerkUserId} not found`);
                }

                return {
                    _id: comment._id.toString(),
                    creator: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    image: clerkUser.imageUrl,
                    clerkId: clerkUser.id,
                    content: comment.content,
                    created_at: comment.created_at
                };
            } catch (error: any) {
                // Handle individual comment fetch errors
                console.error(`Failed to fetch comment user details: ${error.message}`);
                return null; // Or you can choose to handle it differently
            }
        }));

        // Filter out any null comments if any errors occurred
        return comments.filter(comment => comment !== null) as CommentFormatted[];

    } catch (error: any) {
        throw new Error(`Failed to get comments for post ID ${postId}: ${error.message}`);
    }
}

// Function to delete a comment
export async function deleteComment(commentId: string): Promise<void> {
    await connectToDB();
    try {
        const postObject = await Post.findOne( { commentIDs: commentId } )
        const existingComment = await Comment.deleteOne({ _id: commentId });

        if (existingComment.deletedCount === 1) {
            postObject.commentIDs.pull(commentId)
            await postObject.save()
            console.log("Comment deleted successfully :)");
        } else {
            console.log("Comment not found :(");
        }
    } catch (error: any) {
        throw new Error(`Failed to delete comment: ${error.message}`);
    }
}
"use client";
import axios from "axios";
import NavBar from "../components/navbar";
import React, { useEffect, useState } from 'react';
import { deletePost, likePost } from "../lib/actions/post.actions";
import { followUser } from "../lib/actions/user.actions";
import { Input } from "@nextui-org/react";
import { deleteComment, getComments, newComment } from "../lib/actions/comment.action";
import { useRouter } from 'next/navigation';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";
import '../styles.css';

interface ClerkUser {
  userId: string;
  image: string;
}

interface User {
  _id: string;
  followings: string[];
}

interface CommentFormatted {
  _id: string;
  creator: string;
  image: string;
  clerkId: string;
  content: string;
  created_at: string;
}

interface Post {
  _id: string;
  userId: string;
  clerkId: string;
  imageLink: string;
  description: string;
  recipe: string;
  likes: string[];
  commentIDs: string[];
  postComments: CommentFormatted[];
  creator: string;
  image: string;
  created_at: string;
  isLiked?: boolean;
  isFollowed?: boolean;
}

export default function Page() {
  const [clerkUserId, setClerkUserId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentContent, setCommentContent] = useState<string>("");
  const [visibleBoxes, setVisibleBoxes] = useState<{ [postId: string]: { comment: boolean; recipe: boolean; } }>({});
  const [dropdowns, setDropdowns] = useState<{ [postId: string]: boolean }>({});
  const [confirms, setConfirms] = useState<{ [postId: string]: boolean }>({});
  const [sortingCriterion, setSortingCriterion] = useState<'followings' | 'releaseDate'>('releaseDate');
  const [isLikeProcessing, setIsLikeProcessing] = useState<{ [postId: string]: boolean }>({});
  const [isFollowProcessing, setIsFollowProcessing] = useState<{ [followUserId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const truncateText = (text: string) => {
    return text.length > 20 ? text.substring(0, 21) + '...' : text;
  };

// Modify your `fetchUserAndPosts` function to pass the sorting criterion
  const fetchUserAndPosts = async () => {
    try {
      const userInfo = await fetchUserId();
      if (userInfo.userId) {
        setUserId(userInfo.userId);
        await fetchPosts(userInfo.userId, userInfo.followings, sortingCriterion);
      }
    } catch (error) {
      console.error("Error fetching user and posts:", error);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, [sortingCriterion]);

  const fetchUserId = async (): Promise<{ userId: string; followings: string[] }> => {
    try {
      setLoading(true); // Start loading
      const response = await axios.get<ClerkUser>('/api/getUserId', {
        headers: {
          'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
        },
      });
      if (response.data.userId) {
        setClerkUserId(response.data.userId);
        const userResponse = await axios.get<User>('/api/getUser', {
          headers: {
            'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
          },
        });
        return { userId: userResponse.data._id, followings: userResponse.data.followings };
      } else {
        router.push('/')
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return { userId: "", followings: [] };
    } finally {
      setLoading(false); // End loading
    }
  };

  const fetchPosts = async (currentUserId: string, followings: string[], sortingCriterion: 'followings' | 'releaseDate') => {
    try {
      const response = await axios.get<Post[]>('/api/getPosts', {
        headers: {
          'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
        },
      });
      const updatedPosts = response.data.map(post => ({
        ...post,
        isLiked: post.likes.includes(currentUserId),
        isFollowed: followings.includes(post.userId),
      }));
  
      updatedPosts.sort((a, b) => {
        // Sort by followings
        if (sortingCriterion === 'followings') {
          const aIsFollowing = followings.includes(a.userId) ? 1 : 0;
          const bIsFollowing = followings.includes(b.userId) ? 1 : 0;
          if (aIsFollowing !== bIsFollowing) {
            return bIsFollowing - aIsFollowing;
          }
        } else {
          // Sort by release date
          const dateDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          if (dateDiff !== 0) {
            return dateDiff;
          }
        }
        // Finally, move liked posts to the bottom
        const aIsLiked = a.isLiked ? 1 : 0;
        const bIsLiked = b.isLiked ? 1 : 0;
        return aIsLiked - bIsLiked;
        
      });
  
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };  

  const updatePostComments = (postId: string, newComments: CommentFormatted[]) => {
    const updatedPosts = posts.map(post =>
      post._id === postId ? { ...post, postComments: newComments || [] } : post
    );
    setPosts(updatedPosts);
  };
  
  const fetchComments = async (postId: string) => {
    try {
      const postComments = await getComments(postId);
      // Sort comments by date
      postComments.sort((a: CommentFormatted, b: CommentFormatted) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      updatePostComments(postId, postComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCriterion = async (sortingCriterion: 'followings' | 'releaseDate') => {
    setSortingCriterion(sortingCriterion)
  }

  const handleLikeClick = async (postId: string, isLiked: boolean) => {
    if (isLikeProcessing[postId]) return; // Prevent duplicate requests
  
    setIsLikeProcessing(prev => ({ ...prev, [postId]: true }));
  
    try {
      await likePost(clerkUserId, postId, !isLiked);
      setPosts(prevPosts => prevPosts.map(post =>
        post._id === postId ? { ...post, isLiked: !isLiked, likes: isLiked ? post.likes.filter(id => id !== clerkUserId) : [...post.likes, clerkUserId] } : post
      ));
    } catch (error) {
      console.error("Error handling like click:", error);
    } finally {
      setIsLikeProcessing(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleFollowClick = async (followUserId: string, isFollowed: boolean) => {
    if (isFollowProcessing[followUserId]) return;

    setIsFollowProcessing(prev => ({ ...prev, [followUserId]: true }));

    try {

      setLoading(true); // Start loading
      await followUser(clerkUserId, followUserId, !isFollowed);
      setPosts(posts.map(post => 
        post.userId === followUserId ? { ...post, isFollowed: !isFollowed } : post
      ));
    } catch (error) {
      console.error("Error handling follow click:", error);
    } finally {
      setLoading(false); // End loading
      setIsFollowProcessing(prev => ({ ...prev, [followUserId]: false }));
    }
  };

  const handleCommentClick = async (postId: string, content: string) => {
    try {
        if (content !== "") {
          setLoading(true); // Start loading
          await newComment(postId, userId, content);
          setCommentContent(""); // Clear the input field
          await fetchComments(postId); // Refresh comments
        }
    } catch (error) {
        console.error("Error handling comment click:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
        setLoading(true); // Start loading
        await deleteComment(commentId);
        await fetchComments(postId); // Refresh comments
    } catch (error) {
        console.error("Error handling comment click:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleShare = (PostId: string) => {
    window.open(`/recipe?postId=${PostId}`, '_blank')
  }

  const confirmDelete = async (postId: string) => {
    try {
      setLoading(true); // Start loading
      await deletePost(postId);
      await fetchUserAndPosts();
    } catch (error) {
      console.error("Error handling delete click:", error);
    } finally {
      setLoading(false); // End loading
    }
  }

  const toggleCommentBox = async (postId: string) => {
    setVisibleBoxes(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comment: !prev[postId]?.comment
      }
    }));

    if (!visibleBoxes[postId]?.comment) {
      await fetchComments(postId);
    }
  };

  const toggleRecipeBox = (postId: string) => {
    setVisibleBoxes(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        recipe: !prev[postId]?.recipe
      }
    }));
  };

  const toggleDropDown = (postId: string) => {
    setDropdowns(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleConfirm = (postId: string) => {
    setConfirms(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
        <div className="bg-white relative">
          <NavBar />
          <div className="text-black flex flex-col items-center mt-5 relative z-10 px-10">
          <div className="flex items-center justify-end space-x-2 w-full">
            <p className="text-gray-700">Sort By:</p>
            <Dropdown className="bg-gray-200 text-black text-center">
              <DropdownTrigger>
                <Button variant="shadow">
                  {sortingCriterion === 'releaseDate' ? 'Release Date' : 'Followings'} <i className="fa-solid fa-sort"></i>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Sorting Options">
                <DropdownItem
                  onClick={() => handleCriterion('followings')}
                  className="hover:bg-rose-500"
                >
                  Followings
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleCriterion('releaseDate')}
                  className="hover:bg-rose-500"
                >
                  Release Date
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

            {posts.length > 0 ? (
              posts.map(post => (
            <div key={post._id} className="relative flex flex-col px-4 bg-white shadow-xl w-full lg:w-4/12 mb-7">
                <div className="relative">
                  <div className="flex items-center mt-5 mb-5">
                    <img className='rounded-full w-8 h-8' src={`${post.image}?${new URLSearchParams({ height: "32", width: "32", quality: "100", fit: "crop" })}`} onClick={() => router.push(`/profile?clerkId=${post.clerkId}`)} alt="User profile" />
                    <div className="relative group">
                      <h3 className="mx-2 hover:text-blue-500" onClick={() => router.push(`/profile?clerkId=${post.clerkId}`)}><strong>{truncateText(post.creator)}</strong></h3>
                      <div className="absolute right-0 z-50 transform hidden group-hover:block bg-blue-500 text-white text-xs rounded py-1 px-2 text-center">
                        View Profile
                      </div>
                    </div>
                    {userId !== post.userId ? (
                      <button
                        className={`ml-3 transition transform hover:scale-110 px-2 p-1 rounded ${post.isFollowed ? 'bg-rose-600' : 'bg-red-500'}`}
                        onClick={() => handleFollowClick(post.userId, post.isFollowed || false)}
                      >
                        {post.isFollowed ? '✓ Followed' : 'Follow'}
                      </button>
                    ) : (
                      <div className="ml-auto">
                        <button 
                          className="transition transform hover:scale-110 px-2 p-1 rounded"
                          onClick={() => toggleDropDown(post._id)}>☰</button>

                        {dropdowns[post._id] && (
                          <div className="absolute right-0 z-50 p-1 bg-white border border-gray-300 rounded shadow-lg lg:translate-x-[100%] translate-x-[-50%] translate-y-[-50%]"
                          style={{ width: 'auto', height: 'auto', margin: '0'}}>
                            <a
                              className="block px-2 text-gray-800 hover:bg-blue-300 rounded"
                              onClick={() => router.push(`/edit?id=${post._id}`)}
                            >
                              Edit Post
                            </a>
                            <a
                              className="block px-2 text-gray-800 hover:bg-rose-500 rounded"
                              onClick={() => toggleConfirm(post._id)}
                            >
                              Delete Post
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-0 pb-[100%]">
                <img
                  src={post.imageLink}
                  alt={post.description}
                  className="absolute inset-0 object-cover w-full h-full px-1 rounded-xl"
                />
              </div>
          </div>
      </div>
      <div>
        <div className="flex items-center justify-between md:gap-4 mt-3 px-2 py-1 bg-white rounded-lg">
          <div className="flex items-center gap-4">
            <button
              className="text-xl transition-transform transform hover:scale-110 hover:text-rose-500"
              onClick={() => handleLikeClick(post._id, post.isLiked || false)}
              aria-label="Like Post"
            >
              {post.isLiked ? (
                <i className="fa-solid fa-heart text-rose-500"></i>
              ) : (
                <i className="fa-regular fa-heart text-gray-500"></i>
              )}
            </button>
            <button
              className="text-xl transition-transform transform hover:scale-110"
              onClick={() => toggleRecipeBox(post._id)}
              aria-label="Toggle Recipe Box"
            >
              <i className="fa-solid fa-utensils"></i>
            </button>
            <button
              className="text-xl transition-transform transform hover:scale-110"
              onClick={() => toggleCommentBox(post._id)}
              aria-label="Toggle Comment Box"
            >
              <i className="fa-regular fa-comment"></i>
            </button>
          </div>
          <p className="text-gray-600 text-md">
            {formatDate(post.created_at)}
          </p>
        </div>
      </div>
      <p className="px-1">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</p>
      <h3 className="w-full mt-3 mb-3 px-1">{post.description}</h3>

      {/* Comment Box */}
      {visibleBoxes[post._id]?.comment && (
        <div
        className="absolute top-0 right-0 bg-white border border-gray-300 z-20 rounded-xl shadow-xl flex flex-col md:transform lg:translate-x-[100%]"
        style={{ width: '100%', height: '100%', margin: '0' }}
      >
      <div className="flex-1 p-6 mb-6 overflow-y-auto custom-scrollbar">
        <h4 className="text-3xl font-semibold text-center mb-4">Comments</h4>
        <button onClick={() => toggleCommentBox(post._id)} className="absolute top-3 right-6 pr-2 text-gray-600 hover:text-gray-900">
          <i className="fa-solid fa-x"></i>
        </button>
        <div className="max-h-full">
          {post.postComments && Array.isArray(post.postComments) ? (
            post.postComments.length > 0 ? (
              post.postComments.map((comment, index) => (
                <div key={index} className=" p-4 flex items-start bg-white rounded-lg">
                  <img 
                    className="rounded-full mr-4 w-8 h-8"
                    src={`${comment.image}?${new URLSearchParams({ height: "32", width: "32", quality: "100", fit: "crop" })}`} 
                    alt={`${comment.creator}'s profile`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                      <h4 
                        className="font-semibold text-lg cursor-pointer hover:text-blue-500"
                        onClick={() => router.push(`/profile?clerkId=${comment.clerkId}`)}
                      >
                        {truncateText(comment.creator)}
                      </h4>
                      <div className="absolute right-0 z-50 left-10 transform hidden group-hover:block bg-blue-500 text-white text-xs rounded py-1 px-2 text-center" style={{ width: '90px' }}>
                        View Profile
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">{new Date(comment.created_at).toLocaleDateString()}</span>
                      <button 
                        className="ml-auto text-red-500 hover:text-red-700 transition-transform duration-300 hover:scale-110"
                        onClick={() => handleDeleteComment(post._id, comment._id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No comments available.</p>
            )
          ) : (
            <p className="text-center text-gray-500">Loading comments...</p>
          )}
        </div>
      </div>
      <div className="flex p-4 bg-gray-100 border-t border-gray-200">
        <Input
          className="flex-1 mr-4 border border-gray-300 rounded-xl"
          size="md"
          placeholder="Share your thoughts..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
        <button
          className="flex items-center justify-center p-2  text-white rounded-full transition-transform duration-300 hover:scale-110"
          onClick={() => handleCommentClick(post._id, commentContent)}
        >
          <img 
            className="h-6 w-6"
            src="send.png"
            alt="Send"
          />
        </button>
      </div>

        </div>
      )}

      {/* Recipe Box */}
      {visibleBoxes[post._id]?.recipe && (
        <div
          className="absolute top-0 right-0 bg-white border border-gray-300 z-20 rounded-xl shadow-xl flex flex-col md:transform lg:translate-x-[-100%]"
          style={{ width: '100%', height: '100%', margin: '0' }}
        >
          <div className="flex-1 p-5 mb-6 px-10 overflow-y-auto custom-scrollbar">
            <h4 className="text-3xl font-semibold text-center mb-4">Recipe</h4>
            <button onClick={() => toggleRecipeBox(post._id)} className="absolute top-3 right-6 pr-2 text-gray-600 hover:text-gray-900">
              <i className="fa-solid fa-x"></i>
            </button>
            <div className="max-h-full">
              {post.recipe ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: post.recipe
                    .replace(/<ul>/g, '<ul class="list-disc pl-5">')
                    .replace(/<ol>/g, '<ol class="list-decimal pl-5">')
                    .replace(/<li>/g, '<li class="mb-2">'),
                }}
                  
                />
              ) : (
                <p>No recipe available.</p>
              )}
            </div>
          </div>
          <div className="relative group">
          <i
            className="fa-solid fa-download absolute bottom-4 right-4 py-2 px-4 rounded-xl hover:text-blue-600 hover:scale-110"
            onClick={() => handleShare(post._id)}
          ></i>
          <div className="absolute right-0  transform hidden group-hover:block bg-blue-500 text-white text-xs rounded py-1 px-2">
            Share Recipe
          </div>
        </div>
        </div>
      )}


      {/* Delete Confirmation */}
      {confirms[post._id] && (
        <div
          className="inset-0 items-center justify-center absolute bg-white border m-auto border-gray-300 z-30 rounded-xl flex flex-col shadow-xl"
          style={{ width: 'auto', height: '200px', margin: '0', transform: 'translateY(110%)' }}
        >
          <div className="p-5">
            <h4 className="font-semibold text-2xl text-center mb-3">Confirm Deletion</h4>
            <p className="text-center mb-3">Are you sure you want to delete this post?</p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => confirmDelete(post._id)}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {toggleConfirm(post._id); toggleDropDown(post._id)}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ))
  ) : (
  <p>Loading...</p>
  )}
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
          <img src="/cookieLoad.gif" alt="Loading" className="lg:w-[15vw] lg:h-[15vw] w-[25vw] h-[25vw]" />
        </div>
      )}
    </div>
  );
}

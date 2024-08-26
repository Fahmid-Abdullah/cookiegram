"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@nextui-org/react';
import { likePost, deletePost } from '../lib/actions/post.actions';
import { deleteComment, getComments, newComment } from '../lib/actions/comment.action';
import { followUser } from '../lib/actions/user.actions';

interface CommentFormatted {
  _id: string;
  creator: string;
  image: string;
  clerkId: string;
  content: string;
  created_at: string;
}

interface minimalPost {
  _id: string;
  imageLink: string;
  description: string;
  created_at: string;
}

interface Post {
  _id: string;
  userId: string;
  imageLink: string;
  description: string;
  recipe: string;
  likes: string[];
  commentIDs: string[];
  postComments: CommentFormatted[];
  clerkUserId: string;
  creator: string;
  image: string;
  created_at: string;
  isLiked?: boolean;
  isFollowed?: boolean;
}

interface User {
  _id: string;
  followings: string[];
}

interface PostDetailsProps {
  minimalPost: minimalPost | null;
  user: User | undefined;
  clerkUserId: string;
  onClose: () => void;
}

const PostDetails: React.FC<PostDetailsProps> = ({ minimalPost, user, clerkUserId, onClose }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const [commentContent, setCommentContent] = useState<string>("");
  const [visibleBoxes, setVisibleBoxes] = useState<{ [postId: string]: { comment: boolean; recipe: boolean } }>({});
  const [dropdown, setDropdown] = useState<{ postId: string | null, isOpen: boolean }>({ postId: null, isOpen: false });
  const [confirm, setConfirm] = useState<{ postId: string | null, isConfirmed: boolean }>({ postId: null, isConfirmed: false }); 
  const [isLikeProcessing, setIsLikeProcessing] = useState<boolean>(false);
  const [isFollowProcessing, setIsFollowProcessing] = useState<{ [followUserId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const truncateText = (text: string) => {
    return text.length > 20 ? text.substring(0, 21) + '...' : text;
  };


  const fetchPostDetails = async () => {
    if (minimalPost) {
      try {
        setLoading(true); // Start loading
        const response = await fetch(`/api/getPost?postId=${minimalPost._id}`, {
          headers: {
            'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN ?? '', // Fallback to empty string if undefined
          },
        });
        const data = await response.json();
        if (response.ok && data.post) {
          setPost(data.post);
          setIsLiked(data.post.likes.includes(user?._id) || false);
          setIsFollowed(user?.followings.includes(data.post.userId) || false);
        } else {
          console.error('Failed to fetch post details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setLoading(false); // End loading
      }
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [minimalPost]);

  const handleLikeClick = async () => {
    if (post) {
      try {
        if (isLikeProcessing) return; // Prevent duplicate requests

        setIsLikeProcessing(true);

        // Toggle the like status on the server
        await likePost(clerkUserId, post._id, !isLiked);
  
        // Update the local state to reflect the change
        setIsLiked(prev => !prev);
        setPost(prevPost => {
          if (!prevPost) return null;
  
          const updatedLikes = isLiked
            ? prevPost.likes.filter(id => id !== clerkUserId) // Remove like if already liked
            : [...prevPost.likes, clerkUserId]; // Add like if not already liked
  
          return { ...prevPost, likes: updatedLikes };
        });
        await fetchPostDetails()
      } catch (error) {
        console.error("Error handling like click:", error);
      } finally {
        setIsLikeProcessing(false);
      }
    }
  };

  const handleFollowClick = async ( followUserId: string) => {
    if (isFollowProcessing[followUserId]) return;

    setIsFollowProcessing(prev => ({ ...prev, [followUserId]: true }));

    if (post) {
      try {
        setLoading(true); // Start loading
        await followUser(clerkUserId, followUserId, !isFollowed);
        setIsFollowed(prev => !prev);

      } catch (error) {
        console.error("Error handling follow click:", error);
      } finally {
        setLoading(false); // End loading
        setIsFollowProcessing(prev => ({ ...prev, [followUserId]: false }));
      }
    }
  };

  const handleCommentClick = async () => {
    if (post) {
      try {
        if (commentContent !== "") {
          setLoading(true); // Start loading
          if (user) {
            await newComment(post._id, user?._id, commentContent);
            setCommentContent("");
            await fetchComments(post._id);
          }
        }
      } catch (error) {
        console.error("Error handling comment click:", error);
      } finally {
        setLoading(false); // End loading
      }
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

  const handleUserClick = (ClerkId: string) => {
    router.push(`/profile?clerkId=${ClerkId}`);
    onClose();
  }  

  const handleShare = (PostId: string) => {
    window.open(`/recipe?postId=${PostId}`, '_blank')
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await getComments(postId);
      const sortedComments = response.sort((a: CommentFormatted, b: CommentFormatted) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const updatedPost = post ? { ...post, postComments: sortedComments } : null;
      setPost(updatedPost);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const toggleCommentBox = (postId: string) => {
    setVisibleBoxes(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comment: !prev[postId]?.comment
      }
    }));
    if (!visibleBoxes[postId]?.comment && postId) {
      fetchComments(postId);
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

  const toggleConfirm = (postId: string) => {
    setConfirm(prevState => ({
      postId,
      isConfirmed: !prevState.isConfirmed,
    }));
  };
  
  const toggleDropDown = (postId: string) => {
    setDropdown(prevState => ({
      postId,
      isOpen: !prevState.isOpen,
    }));
  };

  const confirmDelete = async () => {
    if (post) {
      try {
        setLoading(true); // Start loading
        await deletePost(post._id);
        onClose();
      } catch (error) {
        console.error("Error handling delete click:", error);
      } finally {
        setLoading(false); // End loading
      }
    }
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

  if (!post) {
    return <div></div>;
  }

  return (
    <div className="fixed inset-0 px-5 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10 text-black overflow-y-auto custom-scrollbar">
      <div className="bg-white relative p-4 rounded-lg shadow-xl w-full h-fit md:w-[50vw] lg:w-2/6 mx-auto mb-7 m-auto">
        <button onClick={onClose} className="absolute top-2 right-4 pr-2 text-gray-600 hover:text-gray-900">
          <i className="fa-solid fa-x"></i>
        </button>
        <div className="flex items-center mt-5 mb-5">
          <img className='rounded-full w-8 h-8' src={`${post.image}?${new URLSearchParams({ height: "32", width: "32", quality: "100", fit: "crop" })}`} onClick={() => handleUserClick(post.clerkUserId)} alt="User profile" />
          <div className="relative group">
            <h3 className="mx-2 hover:text-blue-500" onClick={() => handleUserClick(post.clerkUserId)}><strong>{truncateText(post.creator) }</strong></h3>
            <div className="absolute left-2 z-50 transform hidden group-hover:block bg-blue-500 text-white text-xs rounded py-1 px-2 text-center" style={{ width: '90px' }}>
              View Profile
            </div>
          </div>
          {user?._id !== post.userId ? (
            <button
              className={`ml-3 transition transform hover:scale-110 px-2 p-1 rounded ${post.isFollowed ? 'bg-rose-600' : 'bg-red-500'}`}
              onClick={() => handleFollowClick(post.userId)}
            >
              {isFollowed ? '✓ Followed' : 'Follow'}
            </button>
          ) : (
            <div className="ml-auto">
              <button 
                className="transition transform hover:scale-110 px-2 p-1 rounded"
                onClick={() => toggleDropDown(post._id)}>☰</button>

              {dropdown.isOpen && (
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
          <div className="flex items-center justify-between md:gap-4 mt-3 px-2 py-1 bg-white rounded-lg">
          <div className="flex items-center gap-4">
          <button
              className="text-xl transition-transform transform hover:scale-110 hover:text-rose-500"
              onClick={() => handleLikeClick()}
              aria-label="Like Post"
            >
              {isLiked ? (
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
            onClick={() => handleCommentClick()}
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
                      __html: post.recipe.replace(/<ul>/g, '<ul class="list-disc pl-5">')
                                        .replace(/<ol>/g, '<ol class="list-decimal pl-5">')
                                        .replace(/<li>/g, '<li class="mb-2">')
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
        {confirm.isConfirmed && (
          <div
            className="inset-0 items-center justify-center absolute bg-white border border-gray-300 z-30 rounded-xl flex flex-col shadow-xl"
            style={{ width: 'auto', height: '200px', margin: '0', transform: 'translateY(110%)' }}
          >
            <div className="p-5">
              <h4 className="font-semibold text-2xl text-center mb-3">Confirm Deletion</h4>
              <p className="text-center mb-3">Are you sure you want to delete this post?</p>
              <div className="flex justify-center space-x-4">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => confirmDelete()}
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
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
          <img src="/cookieLoad.gif" alt="Loading" className="lg:w-[15vw] lg:h-[15vw] w-[25vw] h-[25vw]" />
        </div>
      )}
    </div>
  );
  };

export default PostDetails;

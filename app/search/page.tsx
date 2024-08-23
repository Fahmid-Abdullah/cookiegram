"use client"
import React, { useState, useEffect } from 'react'
import Navbar from '../components/navbar';
import { Input } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import PostDetails from '../components/postdetails';
import axios from 'axios';

interface UserData {
  name: string;
  userid: string;
  clerkId: string;
  clerkImage: string;
}

interface PostData {
  _id: string;
  userId: string;
  clerkId: string;
  imageLink: string;
  description: string;
  likes: string[];
  created_at: string;
}

interface User {
  _id: string;
  followings: string[];
}

interface ClerkUser {
  userId: string;
  image: string;
}

interface minimalPost {
  _id: string;
  imageLink: string;
  description: string;
  created_at: string;
}

export default function Page() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('posts');
  const [userResults, setUserResults] = useState<UserData[]>([]);
  const [postResults, setPostResults] = useState<PostData[]>([]);
  const [isSearchEmpty, setIsSearchEmpty] = useState(true);
  const [currentClerkUserId, setCurrentClerkUserId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User>();
  const [selectedPost, setSelectedPost] = useState<minimalPost | null>(null);
  const [isPostDetailsVisible, setIsPostDetailsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleSearch = async () => {
      // Validate query to ensure only normal characters are used
      const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '');

      if (sanitizedQuery.trim()) {
        try {
          setLoading(true); // Start loading
          const response = await fetch(`/api/search?query=${encodeURIComponent(sanitizedQuery)}&type=${searchType}`, {
            headers: {
              'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN || "", // Pass the token in the request headers
            },
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();

          if (searchType === 'users') {
            setUserResults(data.results);
          } else if (searchType === 'posts') {
            setPostResults(data.results);
          }
          setIsSearchEmpty(false);
        } catch (error) {
          console.error('Fetch error:', error);
          // Optionally handle error state here
        } finally {
          setLoading(false); // End loading
        }
      } else {
        // Clear results and set empty state
        setUserResults([]);
        setPostResults([]);
        setIsSearchEmpty(true);
      }
    };

    handleSearch();
  }, [query, searchType]);

  const fetchUser = async () => {
    try {
        setLoading(true); // Start loading
        const clerkResponse = await axios.get<ClerkUser>('/api/getUserId', {
          headers: {
            'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
          },
        });
        if (clerkResponse.data.userId) {
          setCurrentClerkUserId(clerkResponse.data.userId);
        } else {
          router.push('/')
          throw new Error('User not authenticated');
        }
        
  
        const userResponse = await axios.get<User>('/api/getUser', {
          headers: {
            'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
          },
        });
        setCurrentUser(userResponse.data);

    } catch (error) {
      console.error("Error fetching user ID or user data:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchUser();
  }, [isPostDetailsVisible]);   

  const renderResults = () => {
    if (searchType === 'users') {
      return userResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {userResults.map((user, index) => (
            <div 
              key={index} 
              className="flex items-center p-3 rounded-lg mt-5 bg-white transition-transform transform hover:scale-105 hover:bg-gray-100"
              onClick={() => router.push(`/profile?clerkId=${user.clerkId}`)}
            >
              <img 
                className="rounded-full w-8 h-8" 
                src={`${user.clerkImage}?${new URLSearchParams({ height: "32", width: "32", quality: "100", fit: "crop" })}`} 
                alt="User profile" 
              />
              <span className="ml-4">{user.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No users found.</p>
      );   
    } else if (searchType === 'posts') {
      return postResults?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {postResults.map((post, index) => (
            <div
              key={index}
              className="relative w-64 h-64 bg-gray-200 rounded overflow-hidden group"
              onClick={() => handlePostClick(post)}
            >
              {post.imageLink && (
                <img
                  src={post.imageLink}
                  alt={`Post ${post._id}`}
                  className="w-full h-full object-cover transition duration-300 group-hover:filter group-hover:grayscale"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 p-2 text-white text-sm overflow-hidden">
                <p className="truncate">
                  {post.description}
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-gray-800 bg-opacity-50 text-white text-lg">
                View
              </div>
            </div>
          ))}
        </div>
      ) : isSearchEmpty ? (
        <p className="text-center text-gray-500">No posts available.</p>
      ) : (
        <p className="text-center text-gray-500">No posts found for your search.</p>
      );
    }
  };

  const handlePostClick = (post: minimalPost) => {
    setSelectedPost(post)
    setIsPostDetailsVisible(true);
  };

  return (
    <div className="bg-white relative text-black">
      <Navbar />
      <div className="bg-white relative flex flex-col items-center justify-center mt-5">
        <Input
          type="text"
          value={query}
          size={"lg"}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="rounded-lg p-2 mb-4 w-full max-w-2xl"
        />
        <div className="flex items-center mb-4">
          <div className="flex">
            <label className="mr-4">
              <input
                type="radio"
                name="searchType"
                value="posts"
                checked={searchType === "posts"}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-1"
              />
              Posts
            </label>
            <label>
              <input
                type="radio"
                name="searchType"
                value="users"
                checked={searchType === "users"}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-1"
              />
              Users
            </label>
          </div>
        </div>
        {renderResults()}

      {/* Post Details Visible */}
      {isPostDetailsVisible && (
        <PostDetails minimalPost={selectedPost} user={currentUser} clerkUserId={currentClerkUserId} onClose={() => setIsPostDetailsVisible(false)} />
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

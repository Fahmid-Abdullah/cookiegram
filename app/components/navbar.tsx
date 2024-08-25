"use client";
import React, { useEffect, useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Image from "next/image";
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface ClerkUser {
    userId: string;
    image: string;
  }
  

export default function NavBar() {
    const { user } = useUser();
    const [clerkUser, setClerkUser] = useState<ClerkUser | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchUserId = async () => {
          try {
            const response = await axios.get<ClerkUser>('/api/getUserId', {
                headers: {
                  'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
                },
              });
            if (response.data.userId) {
              setClerkUser(response.data);
            }
          } catch (error) {
            console.error("Error fetching user ID:", error);
          }
        };
    
        fetchUserId();
      }, []);

      const params = new URLSearchParams({
        height: "32",
        width: "32",
        quality: "100",
        fit: "crop",
      });

      const imageSrc = clerkUser?.image ? `${clerkUser.image}?${params.toString()}` : '/cookieHolder.png';

    return (
        <div className='flex md:flex-row items-center flex-col bg-rose-500 px-10 py-3'>
        <div className='relative mb-4 md:mb-0 transition-transform duration-300 hover:scale-110 group'>
            <Link href="/">
                <Image
                    src="/cookieLogo.png"
                    layout="fixed"
                    width={160}
                    height={30}
                    alt="Website Logo"
                    className="transition-transform duration-300 hover:scale-110"
                />
            </Link>
            <div className="absolute transform left-10 hidden group-hover:block bg-gray-400 text-white text-xs rounded py-1 px-2 text-center" style={{ width: '100px' }}>
                Landing Page
            </div>
        </div>

            <div className='flex flex-row items-center justify-center flex-grow'>
                {user && (
                    <div className='flex md:flex-row flex-col md:gap-32 gap-4'>
                        <div className="relative group">
                            <Link href="/home">
                                <h2 className='text-2xl transition-transform duration-300 hover:scale-110'><i className="fa-solid fa-house"></i></h2>
                            </Link>
                        <div className="absolute transform hidden group-hover:block bg-gray-400 text-white text-xs rounded py-1 px-2 text-center" style={{ width: '90px' }}>
                            Home Page
                        </div>
                        </div>
                        <div className="relative group">
                            <Link href="/search">
                                <h2 className='text-2xl transition-transform duration-300 hover:scale-110'><i className="fa-solid fa-magnifying-glass"></i></h2>
                            </Link>
                        <div className="absolute transform hidden group-hover:block bg-gray-400 text-white text-xs rounded py-1 px-2 text-center z-50" style={{ width: '110px' }}>
                            Search Recipes
                        </div>
                        </div>
                        <div className="relative group">
                            <Link href="/new">
                                <h2 className='text-2xl transition-transform duration-300 hover:scale-110'><i className="fa-solid fa-plus"></i></h2>
                            </Link>
                        <div className="absolute transform hidden group-hover:block bg-gray-400 text-white text-xs rounded py-1 px-2 text-center z-50" style={{ width: '75px' }}>
                            New Post
                        </div>
                        </div>
                    </div>
                )}
            </div>
            {user && (
                <div className='flex flex-row gap-16 md:gap-10 md:mt-0 mt-5 items-center'>
                    <div className="relative group">
                        <Link href={`/profile?clerkId=${clerkUser?.userId}`}>
                            <img className='rounded-full w-8 h-8' src={imageSrc} alt="User profile" />
                        </Link>
                        <div className="absolute transform hidden group-hover:block bg-gray-400 text-white text-xs rounded py-1 px-2 text-center z-50" style={{ width: '60px' }}>
                            Profile
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

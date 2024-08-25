"use client"
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NavBar from '../components/navbar';
import { newPost } from '../lib/actions/post.actions';
import 'react-quill/dist/quill.snow.css';
import { useRouter } from 'next/navigation';
import CropModal from '../components/crop';
import { Textarea } from '@nextui-org/react';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface ImgurResponse {
    data: {
        link: string;
    };
    status: number;
}

interface User {
    userId: string;
}

export default function Page() {
    const [uploading, setUploading] = useState<boolean>(false);
    const [imgurLink, setImgurLink] = useState<string>("/uploadImg.png");
    const [clerkUserId, setClerkUserId] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [recipe, setRecipe] = useState<string>('<h2><strong>Ingredients</strong></h2><ul><li>Not Provided</li></ul><h2><strong>Instructions</strong></h2><ol><li>Not Provided</li></ol>');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showCropModal, setShowCropModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [descriptionCount, setDescriptionCount] = useState(250);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (selectedImage) {
            setShowCropModal(true);
        }
    }, [selectedImage]);

    const fetchUser = async () => {
        try {
            setLoading(true); // Start loading
            const response = await axios.get<User>('/api/getUserId', {
                headers: {
                  'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
                },
              });
            if (response.data.userId) {
                setClerkUserId(response.data.userId);
            } else {
                router.push('/')
                throw new Error('User not authenticated');
            }
        } catch (error) {
            console.error("Error fetching user ID:", error);
        } finally {
            setLoading(false); // End loading
          }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
              }

            setSelectedImage(selectedFile);
            event.target.value = '';
        }
    };


    const handleCrop = async (croppedImage: File) => {
        setShowCropModal(false);
        await uploadToImgur(croppedImage);
    };

    const uploadToImgur = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post<ImgurResponse>(
                '/api/uploadImgur',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-api-token': process.env.NEXT_PUBLIC_API_SECRET_TOKEN, // Pass the token in the request headers
                  },
                }
              );

            if (response.status === 200) {
                setImgurLink(response.data.data.link);
                setErrorMessage(''); // Clear any previous error message
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image to Imgur:', error);
            setErrorMessage('Image upload failed. Please try again.');
            setTimeout(() => setErrorMessage(''), 5000); // Clear error message after 5 seconds
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (imgurLink === "/uploadImg.png") {
            setErrorMessage("Please add a description before submitting.");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }        

        if (description === "") {
            setErrorMessage("Please write a description before submitting.");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        if (clerkUserId) {
            setSubmitting(true);
            try {
                setLoading(true); // Start loading
                await newPost(clerkUserId, imgurLink, description, recipe);
                router.push('/home');
            } catch (error) {
                console.error('Error submitting post:', error);
            } finally {
                setSubmitting(false);
                setLoading(false); // End loading
            }
        } else {
            console.error('No user is logged in.');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image', 'video'
    ];

    return (
        <div className='bg-white min-h-screen'>
            <NavBar />
            <h1 className='text-black text-3xl mt-12 text-center font-extrabold tracking-tight'>
                Create A New Post
            </h1>
            <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                className='hidden'
            />
            <div className='lg:flex flex-col md:flex-row justify-center items-start mt-6'>
                <div className="relative mx-auto lg:mx-1 flex justify-center items-center w-[50vw] h-[50vw] lg:w-[30vw] lg:h-[30vw] overflow-hidden rounded-lg">
                    <img
                        src={imgurLink}
                        alt="Upload"
                        className="absolute object-cover w-full h-full rounded-lg p-3 transition-transform duration-300 hover:scale-105 cursor-pointer"
                        onClick={triggerFileInput}
                    />
                </div>
                <form className='text-black lg:flex lg:flex-col w-full lg:w-auto' onSubmit={onSubmit}>
                    <div className='flex flex-col items-center lg:items-start mb-6 mt-5 px-5 w-full'>
                        <label htmlFor="description" className='text-lg font-semibold'>
                            Description:
                        </label>
                        <Textarea
                            value={description}
                            maxLength={250}
                            onChange={(e) => {
                            setDescription(e.target.value);
                            setDescriptionCount(250 - e.target.value.length);
                            }}
                            rows={4}
                            placeholder="Enter your description here"
                        />
                        <p className="text-gray-500">{descriptionCount} characters remaining</p>
                    </div>
                    <div className='flex flex-col items-center lg:items-start mb-6 px-5 w-full'>
                        <label htmlFor="recipe" className='text-lg font-semibold'>
                            Recipe:
                        </label>
                        <ReactQuill
                            value={recipe}
                            onChange={setRecipe}
                            modules={modules}
                            formats={formats}
                            className='mt-2 rounded-lg w-full max-w-2xl bg-white h-52 mb-10'
                        />
                    </div>
                    <div className='mb-6 px-5 flex flex-col items-center'>
                        <button
                            type="submit"
                            className='bg-red-500 text-white mt-5 p-3 w-full max-w-2xl rounded-lg hover:bg-red-700 hover:scale-105 transition-transform duration-300 z-10'
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                        {errorMessage && (
                            <p className='text-red-500 mt-2'>{errorMessage}</p>
                        )}
                    </div>
                </form>
            </div>
            {uploading && (
                <p className='text-black mt-4 text-center animate-pulse'>
                    Uploading...
                </p>
            )}
            {showCropModal && selectedImage && (
                <CropModal
                    src={URL.createObjectURL(selectedImage)}
                    onCrop={handleCrop}
                    onClose={() => setShowCropModal(false)}
                />
            )}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
                <img src="/cookieLoad.gif" alt="Loading" className="lg:w-[15vw] lg:h-[15vw] w-[25vw] h-[25vw]" />
                </div>
            )}
        </div>
    );
}

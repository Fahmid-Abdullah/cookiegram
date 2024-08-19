import React, { useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropModalProps {
    src: string;
    onCrop: (croppedFile: File) => void;
    onClose: () => void;
}

const CropModal: React.FC<CropModalProps> = ({ src, onCrop, onClose }) => {
    const [crop, setCrop] = useState<Crop>({ unit: '%', width: 30, height: 30, x: 0, y: 0 });
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

    const onImageLoaded = (img: HTMLImageElement) => {
        setImage(img);
        setIsImageLoaded(true);
    };

    const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<File | null> => {
        return new Promise<File | null>((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Failed to get canvas context');

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            canvas.width = crop.width;
            canvas.height = crop.height;
            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'croppedImage.jpg', { type: 'image/jpeg' });
                    resolve(file);
                } else {
                    reject('Failed to create cropped image');
                }
            }, 'image/jpeg');
        });
    };

    const handleCropAndSave = async () => {
        if (image && crop.width && crop.height) {
            const croppedFile = await getCroppedImg(image, crop);
            if (croppedFile) {
                onCrop(croppedFile); // Pass the cropped file to the parent component
            } else {
                console.error('Error creating cropped image file');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 px-5">
            <div className="bg-white p-4 rounded shadow-lg relative w-full lg:w-4/12 overflow-auto">
                <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    aspect={1}
                >
                    <img
                        src={src}
                        alt="Crop preview"
                        onLoad={(e) => onImageLoaded(e.currentTarget)}
                    />
                </ReactCrop>
                <div className="mt-2 flex justify-end space-x-2">
                    <button
                        onClick={handleCropAndSave}
                        className="bg-red-500 text-white p-2 rounded disabled:opacity-50"
                        disabled={!isImageLoaded}
                    >
                        Crop and Save
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white p-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropModal;

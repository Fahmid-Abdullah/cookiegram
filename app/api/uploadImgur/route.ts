import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../middleware/authenticate';

const clientId = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'File not provided' }, { status: 400 });
    }

    const imgurFormData = new FormData();
    imgurFormData.append('image', file);
    imgurFormData.append('type', 'file');
    imgurFormData.append('title', 'Simple upload');
    imgurFormData.append('description', 'This is a simple image upload in Imgur');

    const imgurResponse = await axios.post('https://api.imgur.com/3/image', imgurFormData, {
      headers: {
        'Authorization': `Client-ID ${clientId}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(imgurResponse.data);
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

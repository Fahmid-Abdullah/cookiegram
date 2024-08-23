// Import necessary modules
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectToDB } from '@/app/lib/mongoose';
import { validateToken } from '@/app/lib/middleware';

// Define the handler function for the GET request
const handler = async (req: NextRequest): Promise<NextResponse> => {
    await connectToDB();

    try {
        const user = await currentUser();
        if (!user) {
            // Redirect to the homepage if the user is not authenticated
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.json({ 
            userId: user.id, 
            image: user.imageUrl, 
            firstName: user.firstName, 
            lastName: user.lastName 
        });
    } catch (err: any) {
        console.error('Error fetching user data:', err);
        return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }
};

// Export the handler for the GET method
export const GET = validateToken(handler);

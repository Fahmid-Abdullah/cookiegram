import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectToDB } from '@/app/lib/mongoose';

export async function GET(request: Request) {
    await connectToDB();

    try {
        const user = await currentUser();
        if (!user) {
            // Redirect to the homepage if the user is not authenticated
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.json({ 
            userId: user.id, 
            image: user.imageUrl, 
            firstName: user.firstName, 
            lastName: user.lastName 
        });
    } catch (err) {
        console.error('Error fetching user data:', err);
        return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }
}

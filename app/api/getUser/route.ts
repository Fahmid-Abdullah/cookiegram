import { getUser } from '@/app/lib/actions/user.actions';
import { connectToDB } from '@/app/lib/mongoose';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    await connectToDB();

    const user = await currentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    try {
        const userData = await getUser(user.id);
        return NextResponse.json(userData, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: `Failed to fetch user: ${error.message}` }, { status: 500 });
    }
}

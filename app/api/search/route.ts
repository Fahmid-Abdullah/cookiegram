import { NextResponse } from 'next/server';
import Post from '@/app/lib/models/post.model';
import { getAllUsers } from '@/app/lib/actions/user.actions';
import { authenticate } from '../../middleware/authenticate';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const type = url.searchParams.get('type');

  if (!query || !type) {
    return NextResponse.json({ error: 'Query and type are required' }, { status: 400 });
  }

  try {
    if (type === 'posts') {
      // Search posts by description
      const posts = await Post.find({
        description: { $regex: query, $options: 'i' }
      }).exec();
      return NextResponse.json({ results: posts });
    } else if (type === 'users') {
      // Retrieve all users
      const users = await getAllUsers();
      
      // Filter users by name
      const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );

      return NextResponse.json({ results: filteredUsers });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`Search error: ${error.message}`);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

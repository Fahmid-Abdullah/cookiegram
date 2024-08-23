// lib/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';

export const validateToken = (handler: (req: NextRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest) => {
    const secretToken = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;
    
    const token = req.headers.get('x-api-token');
    console.log(token)
    
    if (token !== secretToken) {
      return NextResponse.json({ message: 'Forbidden'}, { status: 403 });
    }

    // Call the handler function and return its response
    return handler(req);
  };
};

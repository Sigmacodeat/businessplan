import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: []
};


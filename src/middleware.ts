import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // 1. Update session if needed (refresh expiry)
    // await updateSession(request); // Optional: keep it simple for now

    const path = request.nextUrl.pathname;

    // Define public paths
    const isPublicPath = path === '/login' || path.startsWith('/api/setup-web-users');

    // Get token
    const cookie = request.cookies.get('auth_token')?.value;
    let session = null;
    if (cookie) {
        session = await decrypt(cookie);
    }

    // 1. Redirect to login if not authenticated and trying to access protected route
    if (!isPublicPath && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Redirect to dashboard if authenticated and trying to access login
    if (isPublicPath && session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Admin-only routes (Access Control)
    // Example: /users is for admins only
    if (path.startsWith('/users')) {
        // @ts-ignore
        if (session?.user?.role !== 'admin') {
            // If not admin, redirect to dashboard or show unauthorized
            // For better UX, maybe redirect to dashboard with a query param?
            return NextResponse.redirect(new URL('/?error=Unauthorized', request.url));
        }
    }

    return NextResponse.next();
}

// Configure paths to match
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

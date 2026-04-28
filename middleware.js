import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public paths - allow auto-login and API auth endpoints
    if (pathname.startsWith('/api/auth') || pathname === '/auto-login') {
        return NextResponse.next();
    }

    // Note: Authentication is now handled client-side via sessionStorage
    // Middleware cannot access sessionStorage, so we allow all requests through
    // Each page component should check sessionStorage for AuthqueryParams
    // and redirect to /auto-login if not authenticated

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

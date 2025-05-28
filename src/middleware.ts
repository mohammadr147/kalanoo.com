
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Explicitly declare the runtime
export const runtime = 'experimental-edge';

// Helper function to verify admin session directly in middleware
async function verifyAdmin(request: NextRequest): Promise<{ valid: boolean; expired: boolean }> {
    const cookie = request.cookies.get('admin_session');
    if (!cookie) {
        return { valid: false, expired: false };
    }
    try {
        const sessionData = JSON.parse(cookie.value);
        // WARNING: Comparing against plain text password stored in env var is insecure.
        // In production, use a server action or API route to verify the session against the database hash.
        // This check might be less reliable in edge middleware depending on env var availability.
        if (sessionData && sessionData.username === (process.env.ADMIN_USERNAME || 'admin')) {
             const now = Date.now();
             const sessionDuration = 60 * 60 * 24 * 1000; // Match the maxAge (1 day)
             if (!sessionData.loggedInAt || (now - sessionData.loggedInAt > sessionDuration)) {
                console.log("Admin session expired in middleware");
                 return { valid: false, expired: true }; // Session expired
             }
            return { valid: true, expired: false }; // Valid session
        }
    } catch (error) {
        console.error('Error parsing admin session cookie:', error);
    }
    return { valid: false, expired: false };
}


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Using a generic name like 'session' for user cookie is common
  const userSessionCookie = request.cookies.get('session')?.value; // User session cookie (check presence)
  const adminVerification = await verifyAdmin(request); // Check admin session status

  // --- Routes ---
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isUserProtectedRoute = ['/profile/complete', '/checkout', '/order/success', '/user'].some(route => pathname.startsWith(route));
  const isAuthRoute = pathname === '/auth'; // User auth page

  // --- Admin Route Logic ---
  if (isAdminRoute) {
    if (isAdminLoginRoute) {
      if (adminVerification.valid) {
        console.log("Middleware: Admin already logged in, redirecting from /admin/login to /admin/dashboard");
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!adminVerification.valid) {
        console.log(`Middleware: Admin not logged in or session invalid/expired, redirecting from ${pathname} to /admin/login`);
        const redirectUrl = new URL('/admin/login', request.url);
        if (adminVerification.expired || request.cookies.has('admin_session')) {
             redirectUrl.searchParams.set('session', 'expired');
             console.log("Middleware: Adding session=expired query param");
        }
        const response = NextResponse.redirect(redirectUrl);
        if (request.cookies.has('admin_session')) {
             console.log("Middleware: Deleting invalid/expired admin_session cookie");
             // Use deleteCookie syntax for NextResponse
             response.cookies.delete('admin_session');
        }
        return response;
    }
    console.log(`Middleware: Admin logged in, allowing access to ${pathname}`);
    return NextResponse.next();
  }

  // --- User Route Logic ---
  // Basic check for user session cookie presence. Actual validation happens client-side or in Server Components/Actions.
  const hasUserSessionCookie = !!userSessionCookie;

  // If user seems logged in (has cookie) and tries to access /auth, redirect to home
  if (isAuthRoute && hasUserSessionCookie) {
       console.log("Middleware: User seems logged in, redirecting from /auth to /");
      return NextResponse.redirect(new URL('/', request.url));
  }

  // If user tries to access protected route without a session cookie, redirect to auth
  if (isUserProtectedRoute && !hasUserSessionCookie) {
    console.log(`Middleware: User not logged in, redirecting from ${pathname} to /auth`);
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirect', pathname); // Add redirect path
    return NextResponse.redirect(redirectUrl);
  }

  // Allow access to public routes or let client-side/server components handle detailed verification
  return NextResponse.next();
}

// --- Matcher Configuration ---
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Public assets can also be excluded if needed, e.g., /images/
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};


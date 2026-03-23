import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/map", "/stores"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for userId cookie
  const userId = request.cookies.get("userId")?.value;

  // If no userId and not on a public route, redirect to login
  if (!userId && !PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (API routes can be public)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};

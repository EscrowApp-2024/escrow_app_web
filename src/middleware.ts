// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// List of public routes (add more as needed)
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verifyEmail",
  "/api",
  "/fund-wallet/processing"
  , // Allow all API routes (customize if needed)
  // ...add other public paths
];

// Helper: Check if path is public
function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((publicPath) =>
    path === publicPath || path.startsWith(publicPath + "/")
  );
}

// Helper: Decode JWT and check expiry (optional)
function isJwtExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
    console.log("Are you there middleware")
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for required cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const sessionData = request.cookies.get("sessionData")?.value;

  // If missing cookies, redirect to login
  if (!accessToken || !sessionData) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }


  // Optionally, add more checks (e.g., sessionData structure)

  // All checks passed, allow request
  return NextResponse.next();
}

// Optionally, configure matcher for only protected routes
export const config = {
  matcher: [
    // Protect all routes except public ones
    "/((?!auth|api|_next|static|favicon.ico).*)",
  ],
};

// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

function generateKeyPair() {
  return new Promise<{ publicKey: string; privateKey: string }>((resolve, reject) => {
    crypto.generateKeyPair(
      "ec",
      {
        namedCurve: "P-256",
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        } else {
          const base64PublicKey = Buffer.from(publicKey).toString("base64");
          const base64PrivateKey = Buffer.from(privateKey).toString("base64");
          resolve({
            publicKey: base64PublicKey,
            privateKey: base64PrivateKey,
          });
        }
      }
    );
  });
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

export async function middleware(request: NextRequest) {
    console.log("Are you there middleware")
  const { pathname } = request.nextUrl;

  if (pathname === "/auth/validate-login") {
    const keys = await generateKeyPair();
    const response = NextResponse.next();
    // Attach keys as cookies (secure, httpOnly for privateKey)
    response.cookies.set("publicKey", keys.publicKey, { path: "/", secure: true });
    response.cookies.set("privateKey", keys.privateKey, { path: "/", httpOnly: true, secure: true });
    return response;
  }

  // Allow public routes
  if (isPublicPath(pathname)) {
    console.log(`This is a public path`)
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
    "/auth/validate-login", // Explicitly protect this route
    "/((?!auth|api|_next|static|favicon.ico).*)", // Protect all except public ones
  ],
};

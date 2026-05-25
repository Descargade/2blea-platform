import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https: http://res.cloudinary.com https://*.pusher.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.pusher.com wss://*.pusher.com ws://localhost:* http://localhost:* https://api.resend.com https://res.cloudinary.com",
  "frame-src 'self' https://js.stripe.com",
  "media-src 'self' https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": CSP,
};

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  // Auth redirects
  const isAdminRoute = pathname.startsWith("/admin");
  const isClientRoute = pathname.startsWith("/cliente");
  const isAuthRoute = pathname.startsWith("/login");

  if (isAuthRoute && isLoggedIn) {
    if (session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/cliente/dashboard", req.url));
  }

  if (isAdminRoute && (!isLoggedIn || session.user.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isClientRoute && (!isLoggedIn || session.user.role !== "CLIENTE")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const response = NextResponse.next();

  // Security headers (production only)
  if (process.env.NODE_ENV === "production") {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // CORS
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "https://localhost:3000",
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/cliente/:path*", "/login", "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

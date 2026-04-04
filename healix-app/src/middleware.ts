import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const ROLE_ROUTES: Record<string, string> = {
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  HOSPITAL: "/hospital",
  PHARMACY: "/pharmacy",
  VENDOR: "/vendor",
};

const PROTECTED_ROUTE_PREFIXES = [
  "/patient",
  "/doctor",
  "/hospital",
  "/pharmacy",
  "/vendor",
];

const AUTH_ROUTES = ["/login", "/signup", "/role-select"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  const isProtected = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Not logged in → redirect auth routes and protected routes to login
  if (!sessionCookie) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Logged in → redirect away from auth pages
  if (isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};

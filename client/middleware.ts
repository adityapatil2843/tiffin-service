import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("tfns_auth_token")?.value;
  const role = request.cookies.get("tfns_user_role")?.value;
  const { pathname } = request.nextUrl;

  // 1. If not authenticated and trying to access protected route, redirect to /login
  if (!token) {
    const isProtectedRoute =
      pathname.startsWith("/owner") ||
      pathname.startsWith("/super-admin") ||
      pathname.startsWith("/user");

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. If authenticated and trying to access /login, redirect to their role dashboard
  if (pathname === "/login") {
    if (role === "superAdmin") {
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }
    if (role === "owner") {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/user/home", request.url));
  }

  // 3. Prevent cross-role route access
  if (pathname.startsWith("/super-admin") && role !== "superAdmin") {
    const target = role === "owner" ? "/owner/dashboard" : "/user/home";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (pathname.startsWith("/owner") && role !== "owner") {
    const target = role === "superAdmin" ? "/super-admin/dashboard" : "/user/home";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (pathname.startsWith("/user") && role !== "user") {
    const target = role === "superAdmin" ? "/super-admin/dashboard" : "/owner/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/owner/:path*", "/super-admin/:path*", "/login", "/"],
};

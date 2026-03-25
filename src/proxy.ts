import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
const SETUP_ROUTE = "/account-setup";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";
  const isProfileCompleted =
    request.cookies.get("isProfileCompleted")?.value === "true";

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isProfileCompleted && pathname !== SETUP_ROUTE) {
    return NextResponse.redirect(new URL(SETUP_ROUTE, request.url));
  }

  if (isProfileCompleted && pathname === SETUP_ROUTE) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

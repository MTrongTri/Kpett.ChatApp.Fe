import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
const SETUP_ROUTE = "/account-setup";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  try {
    const persistedAuth = request.cookies.get("persist%3Aauth")?.value;

    if (!persistedAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const auth = JSON.parse(persistedAuth);
    const isLoggedIn = auth.isLoggedIn === true || auth.isLoggedIn === "true";
    const isProfileCompleted =
      auth.isProfileCompleted === true || auth.isProfileCompleted === "true";

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!isProfileCompleted && pathname !== SETUP_ROUTE) {
      return NextResponse.redirect(new URL(SETUP_ROUTE, request.url));
    }

    if (isProfileCompleted && pathname === SETUP_ROUTE) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (e) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

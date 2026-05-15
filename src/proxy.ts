import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PUBLIC_ROUTES = ["/"];
const PRIVATE_ROUTES = ["/chat"];
const SETUP_ROUTE = "/account-setup";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";
  const isProfileCompleted =
    request.cookies.get("isProfileCompleted")?.value === "true";

  // Hàm kiểm tra route hiện tại có phải là Profile (/{username}) hay không
  // Kịch bản: Route chỉ có 1 cấp (vd: /johndoe) và KHÔNG trùng với bất kỳ route hệ thống/auth nào
  const isProfileRoute =
    /^\/[^/]+$/.test(pathname) &&
    !AUTH_ROUTES.includes(pathname) &&
    !PRIVATE_ROUTES.includes(pathname) &&
    pathname !== SETUP_ROUTE;

  // Gộp chung các trang cho phép truy cập tự do
  const isPostDetailRoute = /^\/post\/[^/]+$/.test(pathname);
  const isPublicAccess =
    PUBLIC_ROUTES.includes(pathname) || isProfileRoute || isPostDetailRoute;

  // LOGIC KHI USER ĐÃ ĐĂNG NHẬP
  if (isLoggedIn) {
    // Tránh việc đã login mà vẫn vào trang Đăng nhập / Đăng ký -> Đẩy về Home
    if (AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Nếu chưa setup account -> Bắt buộc ở lại trang setup
    if (!isProfileCompleted && pathname !== SETUP_ROUTE) {
      return NextResponse.redirect(new URL(SETUP_ROUTE, request.url));
    }

    // Đã setup xong nhưng cố tình vào lại trang setup -> Đẩy về Home
    if (isProfileCompleted && pathname === SETUP_ROUTE) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // LOGIC KHI USER CHƯA ĐĂNG NHẬP
  if (!isLoggedIn) {
    // Nếu trang đang vào không public VÀ cũng không phải trang Auth -> Ép đăng nhập
    if (!isPublicAccess && !AUTH_ROUTES.includes(pathname)) {
      // return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

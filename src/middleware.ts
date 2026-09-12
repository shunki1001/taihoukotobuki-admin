import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// /admin配下・/api/admin配下は、クライアント側のuseSessionチェックだけに頼らず
// サーバー側(middleware)でもセッションを検証する。
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/api/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

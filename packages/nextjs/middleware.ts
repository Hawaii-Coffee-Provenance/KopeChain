import { NextRequest, NextResponse } from "next/server";

const hideWIP = process.env.NODE_ENV === "production";

export function middleware(request: NextRequest) {
  if (!hideWIP) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/forbidden", request.url));
}

export const config = {
  matcher: ["/profile/:path*", "/explore/address/:path*"],
};

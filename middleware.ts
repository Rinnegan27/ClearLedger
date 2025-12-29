import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check email verification for dashboard routes
    if (path.startsWith("/dashboard")) {
      if (!token?.emailVerified) {
        return NextResponse.redirect(
          new URL("/auth/verify-email-required", req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/integrations/:path*",
    "/api/notifications/:path*",
  ],
};

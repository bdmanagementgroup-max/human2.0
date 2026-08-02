import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/dashboard(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/workflows(.*)",
  "/api/rag(.*)",
  "/api/webhooks/paypal",
  "/api/webhooks/clerk",
  "/_next(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

// Admin routes that require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

// Member routes (authenticated users with active subscription)
const isMemberRoute = createRouteMatcher(["/content(.*)", "/api/content(.*)", "/api/user(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Protect admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    const role = (sessionClaims?.metadata as { role?: string })?.role ?? "member";
    if (role !== "admin" && role !== "super_admin") {
      return new Response("Forbidden: Admin access required", { status: 403 });
    }
    return;
  }

  // Protect member routes
  if (isMemberRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // Check subscription status in the background (we'll use a server action for this)
    // The actual check happens in the page/API route
    return;
  }

  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Default: protect everything else
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk proxy
    "/__clerk/:path*",
  ],
};
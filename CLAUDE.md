# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Next.js dev server (localhost:3000)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
npm run db:push   # Push Drizzle schema to the database (no migration files)
npm run db:studio # Drizzle Studio GUI
npm run db:seed   # Seed tracks/content tables (tsx scripts/seed.ts)
```

No test suite is configured yet.

## Architecture

This started as a static marketing landing page and has since grown a full backend: Clerk auth, PayPal subscriptions, and a Neon Postgres database via Drizzle ORM. Hosting target is **Vercel** (Fluid Compute).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Geist fonts · lucide-react · Clerk (`@clerk/nextjs`) · PayPal Subscriptions REST API (hand-rolled in `src/lib/paypal.ts`, no SDK dependency) · Neon serverless Postgres + Drizzle ORM · svix (Clerk webhook verification) · zod

**Payment provider history:** this app originally integrated Stripe, then switched to PayPal (the user's choice — no strong technical reason, just a provider preference). If you see stray references to Stripe anywhere (docs, old comments, git history), they're leftover from that period — the live code path is PayPal-only.

**Path alias:** `@/*` maps to the project root (configured in `tsconfig.json`), so app code imports the `src/` tree as `@/src/...`.

**Important:** the canonical design doc, `docs/superpowers/specs/2026-07-29-human2.0-design.md`, still describes the *original* scope — "no backend in this milestone," PayPal-placeholder-only. That scope has since expanded well beyond the doc (see below). Treat the spec as the source of truth for **locked marketing copy, brand/visual decisions, and the public page structure**, not as an accurate description of current architecture.

### Routes

- `/` — the marketing landing page (see "Page structure" below), public.
- `/sign-in`, `/sign-up` — Clerk catch-all auth pages.
- `/dashboard` — member home. Server component; queries `tracks`/`content`/`userProgress` directly via Drizzle and gates premium content on `getUserWithSubscription()` (DB) or admin role (Clerk `sessionClaims`).
- `/content/[slug]` — individual content item. Client component; fetches `/api/content/[slug]` then separately calls `/api/user/subscription` to decide whether to render the gated body.
- `/admin` — admin-only dashboard. Server component; calls `requireAdmin()` and queries Drizzle directly (users, subscriptions, content, tracks counts + tables).

### API routes (`app/api/`)

- `checkout/route.ts` — creates a PayPal subscription via `src/actions/subscription.ts` → `src/lib/paypal.ts`, returns the PayPal approval-link URL to redirect the client to.
- `portal/route.ts` — despite the name (a Stripe-era holdover — PayPal has no billing-portal equivalent), this now **cancels** the caller's subscription via `cancelSubscription()`. Returns `{ success: true }`, not a URL.
- `content/[slug]/route.ts` — reads a single content item + its track from Drizzle.
- `user/subscription/route.ts` — returns whether the current Clerk user has an active/trialing subscription (via `getUserWithSubscription()`).
- `user/progress/route.ts` — GET/POST for per-user content completion (`userProgress` table).
- `subscribe/route.ts` — newsletter signup used by `EmailCapture`; currently only validates the email and `console.log`s it (see comments in the route for the intended provider — Resend/ConvertKit/Mailchimp — none are wired yet).
- `webhooks/clerk/route.ts` — svix-verified; syncs `user.created` / `user.updated` / `user.deleted` into the `users` table.
- `webhooks/paypal/route.ts` — verifies the PayPal webhook signature (`src/lib/paypal.ts#verifyWebhookSignature`), logs every event to `webhookEvents` for idempotency (skips already-seen `paypalEventId`s), and syncs `BILLING.SUBSCRIPTION.*` / `PAYMENT.SALE.COMPLETED` events into the `subscriptions` table.

### Auth & authorization model

`middleware.ts` defines three route classes via `createRouteMatcher`:
- **Public:** `/`, `/dashboard(.*)`, `/sign-in`, `/sign-up`, both webhook endpoints, static assets.
- **Admin:** `/admin(.*)`, `/api/admin(.*)` — requires a signed-in user *and* `sessionClaims.metadata.role` of `admin`/`super_admin`, or the middleware returns 403.
- **Member:** `/content(.*)`, `/api/content(.*)`, `/api/user(.*)` — middleware only requires sign-in; it does **not** check subscription status. Actual subscription gating happens downstream, either client-side (fetching `/api/user/subscription`) or via `hasActiveSubscription()` / `requireAdmin()` in `src/lib/auth.ts`.

Role and subscription state are **not** the same field: role (`member`/`admin`/`super_admin`) lives on the Clerk user's `public_metadata` (synced into `sessionClaims.metadata.role`), while subscription status lives in Postgres (`subscriptions.status`) and is only settled by the Stripe webhook.

### Database (Drizzle + Neon)

Schema lives entirely in `src/db/schema.ts`: `users` (mirrors Clerk, keyed by `clerkId`), `subscriptions` (keyed by `stripeSubscriptionId`), `tracks`, `content` (belongs to a track, has `isPremium`/`isPublished` flags), `userProgress` (join of user + content), and `webhookEvents` (Stripe event log). Relations are defined with Drizzle's `relations()` helper alongside the tables.

`src/db/index.ts` exports `getDb()`, a lazily-created singleton around `drizzle(neon(...))`. Always go through `getDb()` rather than instantiating a new client.

There are no migration files — `drizzle.config.ts` targets `src/db/schema.ts` directly and `npm run db:push` pushes schema state straight to `DATABASE_URL`. `scripts/seed.ts` seeds the `tracks`/`content` tables and is run standalone with `tsx`, not through `getDb()`.

### Payments — read before touching the subscribe button

**PayPal transition complete.** Stripe has been fully removed.

- `app/components/SubscribeButton.tsx` — the live implementation. Calls `/api/checkout` → `createCheckoutSession(planId)` → `src/lib/paypal.ts#createSubscription()` → returns PayPal approval URL. **Now rendered in:**
  - `Nav.tsx` desktop CTA (inside `SignUpButton` modal trigger)
  - `Nav.tsx` mobile CTA (inside `SignUpButton` modal trigger)
  - `FinalCTA.tsx` (bottom landing page CTA)
- `app/components/PayPalButton.tsx` — **DELETED** (was the Stripe-era placeholder)
- `app/components/PayPalIcon.tsx` — **DELETED**
- `app/api/webhooks/stripe/` — **DELETED** directory
- `stripe` package — **UNINSTALLED**

If asked to "wire up payments" or "fix the subscribe button", the work is done — the buttons are live. What's needed are **PayPal credentials** (see "Environment variables" below).

### Page structure (top to bottom, `app/page.tsx`)

`Nav` → `Marquee` → `Hero` → `Benefits` → `Topics` → `Manifesto` → `Stats` → `FAQ` → `FinalCTA` → `EmailCapture` → `Footer`, each (except `Nav`/`Marquee`) wrapped in `ScrollReveal` for scroll-triggered animation. All section components live in `app/components/`.

`Hero` internally renders `Orbital` (the animated ring visual); it does not currently render either subscribe button (those live in `Nav`/`FinalCTA`).

### Client vs Server components

Most section/marketing components are Server Components. `"use client"` is used for:
- `Nav.tsx` — mobile menu toggle, scroll progress, active-section tracking.
- `FAQ.tsx` — accordion state.
- `ScrollReveal.tsx` — Intersection Observer scroll animations.
- `EmailCapture.tsx` — form handling/loading state.
- `PayPalButton.tsx`, `SubscribeButton.tsx` — click handlers.
- `src/components/ClerkProvider.tsx` — wraps the app in `ClerkProvider`.
- `src/hooks/useAuth.ts` — `useClerkAuth()`/`useOptionalAuth()` wrap Clerk's `useAuth`/`useUser` and derive `role`/`isAdmin` from `sessionClaims.metadata`.
- `app/dashboard/page.tsx`, `app/content/[slug]/page.tsx` — fetch client-side and gate on auth/subscription state.

`app/admin/page.tsx` is the one authenticated page that's a Server Component, doing its auth check and data fetching server-side via `requireAdmin()` + direct Drizzle queries.

### Design system

- **Background:** near-black `#0A0A0F` (`ink` palette in Tailwind config)
- **Primary accent:** cyan `#00E5FF` (Tailwind `cyan-glow`)
- **Secondary accent:** violet `#8B5CF6` (Tailwind `violet-glow`)
- **Fonts:** Geist Sans (body + display), Geist Mono (code labels)
- **Glow effects:** CSS text-shadows (`text-glow-cyan`, `text-glow-violet`) and box-shadows (`shadow-glow-cyan`, `shadow-glow-violet`)
- **Gradient text:** `text-gradient` utility (white → cyan → violet, via `background-clip: text`)
- **Card style:** dark translucent bg + `shadow-card` (inset highlight + soft border + deep shadow)
- **CSS utilities** (in `globals.css`): `text-glow-cyan`, `text-glow-violet`, `text-gradient`, `bg-noise` (SVG noise overlay), `mask-fade-r` (fade right edge), `mask-fade-x` (fade both edges)
- **Anchor links:** `scroll-behavior: smooth` is set globally — internal links like `#manifesto` work with smooth scrolling

### Animation approach

All animations are CSS-only via Tailwind `@keyframes` — no JS animation libraries. Key animations defined in `tailwind.config.ts`:
- `marquee` — infinite horizontal scroll (used in the top ticker)
- `orbit-slow` / `orbit-reverse` — rotating rings (Orbital visual)
- `float` — gentle vertical bob with scale
- `glow` — opacity pulse
- `grid-move` — background-position shift for the hero grid
- `pulse-ring` — scale+opacity for ring effects

### Environment variables

Required for the backend pieces to function (see `.env.local` for the full list, values excluded):

**Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, sign-in/up URL overrides
**Database:** `DATABASE_URL` (Neon) — ✅ configured
**PayPal (Subscriptions API):** — **⚠️ MISSING CREDENTIALS, blocks live payments**
  - `PAYPAL_CLIENT_ID` — from PayPal Developer Dashboard app
  - `PAYPAL_CLIENT_SECRET` — from PayPal Developer Dashboard app
  - `PAYPAL_WEBHOOK_ID` — from PayPal webhook config (point to `/api/webhooks/paypal`)
  - `PAYPAL_PLAN_ID` — from PayPal billing plan creation
  - `NEXT_PUBLIC_PAYPAL_PLAN_ID` — same as above, for client-side default
  - `PAYPAL_API_BASE` — defaults to `https://api-m.sandbox.paypal.com` (sandbox)
**App:** `NEXT_PUBLIC_APP_URL` — must be set to production URL for PayPal return/cancel URLs

Email-provider keys (`RESEND_API_KEY`, `CONVERTKIT_*`, `MAILCHIMP_*`) are present but unused — `EmailCapture`/`/api/subscribe` don't call any of them yet.

### Remaining credential setup (before payments work end-to-end)

| Credential | Where to get it | Notes |
|------------|-----------------|-------|
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) → My Apps & Credentials → Create App | Sandbox or Live |
| `PAYPAL_PLAN_ID` / `NEXT_PUBLIC_PAYPAL_PLAN_ID` | PayPal Dashboard → Subscriptions → Plans → Create Plan | Set billing cycle, $29/mo, get Plan ID |
| `PAYPAL_WEBHOOK_ID` | PayPal Dashboard → Webhooks → Add Webhook → URL: `https://<your-domain>/api/webhooks/paypal` | Subscribe to `BILLING.SUBSCRIPTION.*`, `PAYMENT.SALE.COMPLETED` |
| `CLERK_WEBHOOK_SECRET` | [Clerk Dashboard](https://dashboard.clerk.com/) → Webhooks → Add Endpoint → URL: `https://<your-domain>/api/webhooks/clerk` | Subscribe to `user.created`, `user.updated`, `user.deleted` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (or ngrok for local) | Used for PayPal return/cancel redirect URLs |

All of the above require a **public HTTPS URL** — deploy to Vercel first, or use `ngrok`/`cloudflared` tunnel for local testing.

### Design spec

`docs/superpowers/specs/2026-07-29-human2.0-design.md` is the canonical source for locked copy, brand decisions, and the public page structure — refer to it before changing marketing content or layout. Its "no backend" / "PayPal placeholder only" scope statement is outdated; see "Payments" and the route/database sections above for what's actually implemented.

# Admin Dashboard

Admin dashboard for the platform — built with **Next.js 16 (App Router)**, **shadcn/ui** (Tailwind v4),
**NextAuth v5**, **TanStack Query**, **axios**, and **sonner**.

## Tech & conventions

- **Auth:** NextAuth v5 Credentials provider (`auth.ts`) → backend `/auth/login`. Admin-only.
  The session exposes `accessToken`, `refreshToken`, `role`, `_id`, and `user`.
- **Route protection:** `proxy.ts` (Next 16's renamed `middleware`) redirects guests → `/login`
  and signed-in admins away from auth pages. The dashboard layout also guards via `await auth()`.
- **API layer:** every call lives in [`lib/api.ts`](lib/api.ts) using the axios instance in
  [`lib/axios.ts`](lib/axios.ts). A request interceptor attaches the NextAuth `accessToken` as a
  Bearer token; a response interceptor normalizes errors and signs the user out on `401`.
- **Data fetching:** TanStack Query in every page/component, with skeletons + pagination.
- **Toasts:** `sonner`.
- **Responsive:** desktop fixed sidebar, tablet/mobile drawer (Sheet).

## Environment

`.env`:

```
NEXT_PUBLIC_BASE_URL=http://localhost:5008/api/v1
AUTH_SECRET=...        # NextAuth v5 (Auth.js)
AUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...    # kept for compatibility
NEXTAUTH_URL=http://localhost:3000
```

## Run

```bash
# 1) Backend (separate repo) — seed an admin + demo data, then start it
cd ../backend_michaelmatos
npm run seed      # creates admin@gmail.com / 123456 + demo users, plans, terms, tickets
npm run dev

# 2) This dashboard
npm install
npm run dev       # http://localhost:3000
```

**Login:** `admin@gmail.com` / `123456`

## Pages

| Route | Description |
|---|---|
| `/login`, `/forgot-password`, `/verify-email`, `/reset-password` | Auth flow (OTP-based reset) |
| `/dashboard` | Stats, user-status donut, joining-report chart, new users |
| `/users` | Paginated users, search, status filter, ban/delete |
| `/subscription` | Subscription plan CRUD |
| `/terms` | Terms & Conditions view/edit |
| `/help-support` | Support tickets + status updates |
| `/profile` | Profile + avatar upload + change password |

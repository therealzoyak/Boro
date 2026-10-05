# Boro tech stack

## What is running now

| Layer | Technology | What it does in this repository |
| --- | --- | --- |
| Frontend | React 19 and React DOM 19 | Renders the marketplace, campus directory, groups, forum, storefronts, chat, profiles, and order states. |
| Language | TypeScript 5.9 in strict mode | Types the listings, bookings, service orders, groups, messages, and React components. |
| Build and development | Vite 7 | Serves the local app and builds static assets into `dist/`. `npm run build` first checks TypeScript with `tsc -b`. |
| Styling | Handwritten CSS in `src/style.css` and `src/marketplace.css` | Responsive layout and separate Boro turquoise and UIUC blue/orange treatments. No CSS framework is installed. |
| Icons | `lucide-react` | UI controls and navigation. |
| Brand assets | `public/boro-wordmark.svg`, `public/boro-mark.svg` | Custom vector wordmark and browser icon. Local DM Sans, Manrope, and Bricolage Grotesque font files. The two penguin-shaped o's meet flippers beneath the r. |
| Photos | Bundled Pexels images and a University of Illinois Main Quad image | Demo listing, storefront, profile, group, and campus imagery. Sources are recorded in `PHOTO_SOURCES.md`. Optimized assets are bundled under `public/images/`. |
| State and data | React state plus browser `localStorage` | Persists account-specific saved items (`boro-saved-v1`), two seeded demo stores (`boro-demo-v3` and `boro-extras-v2`) plus compressed listing and condition photos in one browser. These uploads are not shared across devices or visitors. Reset demo reseeds both and clears saved items. |
| Demo seams | `src/demoServices.ts` | Replaceable wrappers for storage, account selection, and simulated checkout. |
| Repository | Git and GitHub | Source control at [therealzoyak/Boro](https://github.com/therealzoyak/Boro). |

The app is currently a **client-side prototype**. The [public interactive demo](https://therealzoyak.github.io/Boro/) is deployed on GitHub Pages. There is no backend, database, real sign-in, live messaging, payment processor, or university verification. Account switching and payment confirmation are simulations. Private-group visibility is enforced only in the browser, so the demo must not be treated as a secure private marketplace.

### Current code layout

- `src/App.tsx`: Boro-to-UIUC navigation, rentals, loan agreements, date validation, borrower/lender state, and the shared shell.
- `src/Extras.tsx`: campus groups, urgent forum, offers, services, storefronts, sales, rent-to-buy, messages, and service orders.
- `src/photos.tsx`: photo selection and image fallback components.
- `src/MarketplaceCard.tsx`: shared listing cards and account-specific saved-item state.
- `src/demoServices.ts`: small integration seam for replacing the demo services.
- `public/`: wordmark and favicon.
- `index.html`: document title, viewport, theme color, and favicon.

## Recommended production stack

This is a proposed implementation path, **not software already connected to Boro**.

| Concern | Recommended choice | Why it fits Boro |
| --- | --- | --- |
| Web client | Keep React + TypeScript + Vite | The current UI and domain flows can be retained while data moves behind APIs. |
| Hosting | Vercel for the static Vite frontend, or another static host | Git-based preview deployments make campus and service UX easy to review. [Vercel documents Vite deployment](https://vercel.com/docs/frameworks/frontend/vite). |
| Authentication | Supabase Auth with verified email; add campus membership approval in Boro's own data model | Sign-in identity and group approval are distinct. A matching email domain alone should not make a person an approved member of a private group. [Supabase Auth architecture](https://supabase.com/docs/guides/auth/architecture). |
| Database | Supabase Postgres | Relational transactions suit listings, reservations, groups, service orders, offers, and messages. [Supabase database overview](https://supabase.com/docs/guides/database/overview). |
| Authorization | Postgres grants and Row Level Security (RLS) | Scope every read and write by `campus_id`, owner, participant, and approved group membership. Test both allowed and denied access. [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security). |
| Live chat and urgent activity | Persist messages in Postgres and deliver updates through private Supabase Realtime channels | Participants see new messages and forum offers promptly. Channel permissions must match database permissions. [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization). |
| User uploads | Supabase Storage for listing images and avatars | Apply upload and read rules per user and per group; scan and resize uploads before public display. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control). |
| Server operations | TypeScript server functions or a small TypeScript API | Own booking conflicts, price calculations, offer acceptance, order transitions, moderation actions, and payment creation. Client-provided prices and statuses should never be authoritative. |
| Marketplace payments | Stripe Connect for seller onboarding and payouts, with Stripe Checkout or Payment Intents for buyer payment | Supports real seller payments, refunds, and platform fees when Boro is ready to transact. Choose charge and liability models with counsel and Stripe implementation guidance. [Stripe marketplace guide](https://docs.stripe.com/connect/marketplace). |
| Payment events | Signed Stripe webhooks processed idempotently | Update an order only after a verified event. Do not trust a browser “payment complete” flag. [Stripe signature guidance](https://docs.stripe.com/webhooks/signature). |
| Quality gates | TypeScript build, unit tests for pricing and state transitions, API/RLS tests, and Playwright journeys | Catch booking overlaps, unauthorized group access, wrong lead times, and checkout regressions before release. |

### Core data model

Every campus-owned record should carry a `campus_id`. The minimum tables are `campuses`, `users`, `campus_memberships`, `profiles`, `groups`, `group_memberships`, `listings`, `listing_photos`, `availability_windows`, `bookings`, `service_orders`, `urgent_posts`, `urgent_offers`, `threads`, `messages`, `payments`, and `notifications`. Add audit/event records for order and booking changes.

An item listing has a **transaction mode** (`rent`, `sell`, or `rent_and_buy`) and can expose rental rate and/or buyout price. Service listings have a base price, quantity rule, lead time, and availability. Listings also record a meetup type and a public pickup location, such as a campus landmark, cafe, or apartment lobby. A service order moves through `requested → accepted → payment_pending → confirmed → fulfilled`, with cancellation and refund paths. The server calculates totals and checks availability in a database transaction. For rentals, prevent overlapping confirmed bookings in the database, not only in the browser.

### Recommended build order

1. Move seeded profiles, campus memberships, listings, groups, and forum posts into Postgres; implement access rules before inviting real users.
2. Add real sign-in, campus approval, image uploads, and private group membership controls.
3. Add server-owned booking and service-order state transitions, then live chat and notifications.
4. Add Stripe Connect onboarding and payments after the nonpayment flows and refund rules are settled.
5. Add moderation tools, abuse reporting, audit logs, operational monitoring, and backup/restore checks before a public launch.

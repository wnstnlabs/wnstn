# Canopy — Privacy-first analytics (wnstn/canopy)

Next.js 16 + Drizzle + Effect + better-auth. Tiny `< 2kb` cookieless tracker at `@wnstn/canopy`, wrapper at `@wnstn/canopy/nextjs`.

Package names (as requested):
- Tracker: `wnstn/canopy` → npm `@wnstn/canopy` (`packages/canopy`)
- Next.js wrapper: `wnstn/canopy/nextjs` → subpath export of the same package (no extra install)
- App: `wnstn/canopy-client` → `apps/canopy` (this Next.js app, private)

## Stack — no useState / useEffect

- **Runtime**: Next.js App Router (server components + server actions)
- **Validation + side-effects**: `effect` (`Effect.gen`, `ManagedRuntime`, `Layer`, `Context.Tag`)
- **No `useState` / `useEffect`** anywhere — state is server-action + Effect, or synchronous `useMemo` + `Effect.runSync` in the wrapper
- **DB**: Drizzle ORM + Postgres (`drizzle-kit` for migrations, `db/schema.ts` as source of truth)
- **Auth**: `better-auth` standalone. Winston SSO is **optional** via OIDC (`genericOAuth` with discoveryUrl) — zero coupling for OSS self-hosters

## Quick start

```bash
pnpm install
cp apps/canopy/.env.example .env
# set DATABASE_URL + BETTER_AUTH_SECRET
pnpm --filter @wnstn/canopy build
pnpm --filter @wnstn/canopy-client db:generate
pnpm --filter @wnstn/canopy-client db:migrate
pnpm --filter @wnstn/canopy-client dev # :3002
```

Open http://localhost:3002 — Firecrawl-inspired hero with domain input (server action + Effect validation).

## Drizzle

```ts
// db/schema.ts is source of truth — never hand-write SQL
// apps/canopy/lib/db.ts exports `db` (drizzle-orm/node-postgres Pool)
// apps/canopy/lib/effect/db.ts wraps it as Effect Layer:
//   export class Db extends Context.Tag('Db')<Db, typeof drizzleDb>()
//   export const DbLive = Layer.succeed(Db, drizzleDb)
//   export const CanopyRuntime = ManagedRuntime.make(DbLive)

// Usage in routes / server components:
import { Effect } from 'effect';
import { CanopyRuntime } from '@/lib/effect/runtime';
import { Db } from '@/lib/effect/db';

const program = Effect.gen(function* () {
  const db = yield* Db;
  return yield* Effect.tryPromise(() => db.select().from(site));
});
await CanopyRuntime.runPromise(program);
```

Tables: `user/session/account/organization/member` (better-auth) + `site` + `event` (domain analytics).

## Tracking

### CDN — 1 line

```html
<script src="https://canopy.your.app/p.js" data-site-id="canopy_example_com" async></script>
```

Rewritten to `GET /api/script` → serves `packages/canopy/dist/script.js` (gzip ~1.5kb) or inline fallback pre-build.

Behavior: `sendBeacon` → `fetch keepalive`, `credentials:omit`, no cookies, no `localStorage`, in-memory `randomUUID` session, respects `DNT`, filters bots + `file://`, patches `pushState` for SPA.

### NPM

```ts
import { initCanopy, track } from '@wnstn/canopy';
initCanopy({ siteId: 'canopy_xxx' });
track('signup', { plan: 'pro' });
```

### Next.js wrapper — wnstn/canopy/nextjs

Subpath export, **Effect-based, no useState/useEffect**:

```tsx
// app/layout.tsx
import { CanopyProvider } from '@wnstn/canopy/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>
    <CanopyProvider siteId={process.env.NEXT_PUBLIC_CANOPY_SITE_ID!} />
    {children}
  </body></html>;
}

// any client component — Effect-wrapped emit
'use client';
import { useCanopyTrack } from '@wnstn/canopy/nextjs';
const { track } = useCanopyTrack();
track('click_pricing');
```

`CanopyProvider` uses `Effect.gen` + `Effect.runSync` + `useMemo` (no `useEffect`), syncs `instance.options` in render.

## Winston SSO — optional, non-interfering

**Goal**: users can "Continue with Winston" using their Winston credentials on Canopy, but self-hosting Canopy without Winston works perfectly (no hard dep).

### Architecture — OIDC provider/client pair

- **Winston = OIDC Provider**: add `oidcProvider` plugin to `winston/lib/auth.ts`
- **Canopy = OIDC Client**: adds `genericOAuth` provider `winston` only if `WINSTON_OIDC_*` env vars exist

Both use `better-auth`. Enterprise features (organization, admin, etc.) stay on each app independently.

### 1) Enable Winston as OIDC Provider (winston app)

In `winston/lib/auth.ts`:

```ts
import { oidcProvider } from 'better-auth/plugins';

export const auth = betterAuth({
  // ...
  plugins: [
    organization({ ... }),
    sso({ ... }),
    scim({ ... }),
    admin(),
    oidcProvider({
      loginPage: '/login',
      // register Canopy as a trusted OIDC client
    }),
    // ... hubspotIntegrationOAuthConfig ...
  ],
});
```

Then create an OIDC client (via better-auth admin / DB) for Canopy:

- `client_id`: e.g. `canopy`
- `client_secret`: random 32+ chars
- `redirect_uris`: `["https://canopy.your.app/api/auth/callback/winston"]`
- `name`: `Canopy`

Expose: `WINSTON_OIDC_ISSUER=https://winston.your.app`

### 2) Enable Canopy as OIDC Client (this app)

Set in `apps/canopy/.env`:

```env
WINSTON_OIDC_ISSUER=https://winston.your.app
WINSTON_OIDC_CLIENT_ID=canopy
WINSTON_OIDC_CLIENT_SECRET=...
```

That's it. See `apps/canopy/lib/auth/winston.ts:14` — `getWinstonOAuthConfig()` returns `null` when any var missing, and `apps/canopy/lib/auth.ts:59` spreads the `genericOAuth` plugin only when non-null. No env → no Winston button, no crash, fully OSS.

Server side in `lib/auth.ts`:

```ts
const winstonProvider = winstonOAuthProvider(); // null if OSS self-host
plugins: [
  organization(...),
  admin(),
  ...(winstonProvider ? [genericOAuth({ config: [{ providerId:'winston', discoveryUrl: `${issuer}/.well-known/openid-configuration`, ... }] })] : []),
]
```

Client side: `lib/auth-client.ts` needs **no** Winston plugin — `genericOAuth` is handled server-side via `/api/auth/*`. Login page can call `signIn.oauth({ providerId:'winston' })` only if enabled.

### Verification

- Without Winston env: `pnpm build` passes, `/login` shows email/password + org invite flows only.
- With Winston env: `/login` shows "Continue with Winston" → redirects to Winston OIDC authorize → callback creates/links Canopy user (emailVerified:true).

## Dashboard

`app/dashboard/page.tsx` — Server Component, `Effect.gen` + `CanopyRuntime` + Drizzle `select` (no hooks). Shows sites, `count(*)` stats, top paths, install snippet. See `lib/effect/domain.ts` for Effect-validated domain → `canopy_` siteId mapping.

## Ingestion

`app/api/canopy/event/route.ts` — `POST /api/canopy/event` (also CORS). Uses `Effect.gen` + `Db` layer, Drizzle `insert` into `event` table. IP is `sha256(ip + CANOPY_IP_SALT).slice(0,16)`, no PII. Site auto-creates in dev if missing.

## No useState / useEffect audit

```bash
grep -R "useState\|useEffect" --include="*.ts" --include="*.tsx" apps/canopy packages/canopy
# → only comments documenting absence
```

`components/domain-input.tsx` uses a **server action** (`app/actions.ts`) → `Effect.normalizeDomainEffect` pipeline + `redirect`, with a CSS-only radio group for tabs (no client state).

`packages/canopy/src/nextjs.tsx` uses `useMemo` + `Effect.runSync`, no `useEffect`/`useState`.

## Env

See `.env.example`.

## License

MIT — `packages/canopy` is MIT, `apps/canopy` is source-available.

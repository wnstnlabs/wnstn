# Canopy — Privacy-First Analytics

Canopy is a privacy-first, cookieless analytics platform. It's a monorepo containing:

1. **`@wnstn/canopy`** — Core analytics tracker (vanilla JS, <2kb, works everywhere)
2. **`@wnstn/canopy/nextjs`** — React/Next.js wrapper with hooks and SSR support
3. **Canopy Dashboard** — Next.js production dashboard for viewing analytics
4. **Canopy Docs** — Documentation for implementation, API, and SDK

## Monorepo Structure

```
wnstn/
├── apps/
│   └── canopy/                  # Next.js frontend dashboard (this repo)
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # UI + chart components
│       ├── lib/                 # Utilities, auth, db, Effect runtime
│       └── AGENTS.md            # Detailed app architecture
├── packages/
│   ├── canopy/                  # Core tracker library
│   │   └── src/                 # Tracker, types, tests
│   ├── canopy/nextjs/           # React/Next.js wrapper
│   │   └── src/                 # Provider, hooks
│   ├── typescript-config/       # Shared tsconfig
│   ├── eslint-config/           # Shared ESLint config
│   └── ui/                      # Shared UI primitives (future)
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # Workspace config
└── package.json                # Root scripts
```

## Quick Start

```bash
pnpm install
pnpm dev
```

This starts:
- Dashboard on `http://localhost:3002`
- Core SDK watcher for local development

## Key Commands

```bash
pnpm build          # Build all packages
pnpm typecheck      # Type-check all packages
pnpm --filter @wnstn/canopy dev    # Watch the core SDK
pnpm --filter @wnstn/canopy-client dev # Dashboard dev server
pnpm --filter @wnstn/canopy test   # Core SDK unit tests
```

## Architecture

### Privacy-First Design
- **No cookies** — session tracking via `sessionId` only
- **No fingerprinting** — no localStorage, no device fingerprinting
- **DNT aware** — respects the browser Do Not Track header by default
- **IP hashing** — no raw IPs stored, only hashed versions
- **First-party** — events post to your own domain (`/api/canopy/event`), not third-party trackers
- **GDPR friendly** — no PII collected, transparent by default

### Tech Stack
- **Next.js 16** — App Router, Turbopack, React Server Components
- **Drizzle ORM** — Type-safe PostgreSQL queries
- **Effect** — Functional programming for error handling and resource safety
- **Tailwind v4** — Utility-first CSS with dark-only theme
- **Better Auth** — Authentication with sessions
- **Turborepo** — Monorepo orchestration
- **pnpm workspaces** — Package management

### Data Flow
1. Browser loads `p.js` (<1.5kb gzipped)
2. Script collects pageview, outbound clicks, file downloads
3. Events POST to `/api/canopy/event` (same origin)
4. Server validates + stores in Postgres
5. Dashboard queries `/api/analytics/*` to render charts/tables

### Multi-Tenancy
- Each user has workspaces (organizations)
- Each workspace can have multiple sites
- Analytics queries always scoped to the active workspace
- Team management with roles (owner, admin, member)

## SDK Design Philosophy

Our SDK is built on these principles:

1. **Factory over constructor** — `createCanopy()`, not `new Canopy()`
2. **Custom errors** — `CanopyError` with helper methods
3. **Hooks system** — `beforeSend`, `afterSend`, `onError` interceptors
4. **Bundle size** — every KB counts; we ship <2kb
5. **Types first** — all public APIs have full TypeScript types
6. **"Just works"** — autostart on page load, no config needed

For detailed API docs: see [`packages/canopy/AGENTS.md`](packages/canopy/AGENTS.md)
For dashboard architecture: see [`apps/canopy/AGENTS.md`](apps/canopy/AGENTS.md)

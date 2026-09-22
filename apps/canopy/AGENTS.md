# Canopy Analytics — Frontend App

Production-grade analytics dashboard for @wnstn/canopy. Built with Next.js 16, Drizzle ORM, Tailwind v4, and the Effect functional programming library.

## Structure

```
apps/canopy/
├── app/                              # Next.js App Router
│   ├── api/                          # API routes
│   │   ├── canopy/event/route.ts    # Event ingestion endpoint
│   │   ├── analytics/               # Analytics query endpoints
│   │   │   ├── overview/route.ts    # Aggregated stats (totals, timeseries, top pages/referrers/countries)
│   │   │   ├── timeseries/route.ts  # Chart data
│   │   │   ├── top-pages/route.ts   # Top pages
│   │   │   ├── top-referrers/route.ts
│   │   │   ├── top-countries/route.ts
│   │   │   ├── realtime/route.ts    # Live visitor data
│   │   │   ├── events/route.ts      # Paginated event log
│   │   │   └── export/route.ts     # CSV/JSON export
│   │   ├── sites/route.ts           # Site CRUD
│   │   ├── verify/route.ts          # Domain verification check
│   │   ├── auth/[...all]/route.ts   # Better Auth handler
│   │   └── script/route.ts          # Serves the tracking script
│   ├── dashboard/                    # Protected dashboard
│   │   ├── page.tsx                 # Server component — site selector + management toolbar
│   │   ├── Overview.tsx             # Client component — main analytics view
│   │   ├── pages/page.tsx           # Server wrapper for DashboardPages
│   │   ├── Pages.tsx                # Top pages + event log tabs
│   │   ├── events/page.tsx          # Server wrapper
│   │   ├── Events.tsx               # Event log with filtering/search
│   │   ├── realtime/page.tsx        # Server wrapper
│   │   ├── Realtime.tsx             # Live visitors, pulse, event stream
│   │   ├── sources/page.tsx         # Server wrapper
│   │   ├── Sources.tsx              # Referrers + countries charts
│   │   ├── settings/                # Settings pages
│   │   │   ├── page.tsx             # Server — fetches site data, renders SettingsPage
│   │   │   ├── SettingsPageContent.tsx # Tabs for General/Team/Billing/Domain
│   │   │   ├── General.tsx          # Site settings form, tracking options
│   │   │   ├── Team.tsx             # Member management, invitations
│   │   │   ├── Billing.tsx          # Plan management, billing history
│   │   │   └── Domain.tsx           # Custom domain + SSL management
│   │   ├── actions.ts               # Server actions (create/delete site)
│   │   ├── loading.tsx              # Loading state with skeletons
│   │   ├── error.tsx                # Error boundary
│   │   └── not-found.tsx            # 404 page
│   ├── onboarding/page.tsx           # Setup wizard (script tag / Next.js)
│   ├── docs/                         # Documentation pages
│   │   ├── page.tsx                 # Main docs
│   │   ├── install/page.tsx         # Install guide
│   │   └── api/page.tsx             # HTTP API reference
│   └── login/, signup/               # Auth pages
├── components/
│   ├── ui/                           # shadcn/ui-style primitive components
│   │   ├── Button.tsx               # Button, variants: default, destructive, outline, secondary, ghost, link, success
│   │   ├── Input.tsx, Textarea.tsx
│   │   ├── Label.tsx
│   │   ├── Card.tsx                 # Card + CardHeader/CardTitle/CardDescription/CardContent/CardFooter
│   │   ├── Badge.tsx              # Badge with variants: default, secondary, destructive, outline, success, warning
│   │   ├── Select.tsx             # Full select with Radix UI
│   │   ├── Tabs.tsx               # Tabs with Radix UI
│   │   ├── Dialog.tsx             # Modal dialog
│   │   ├── DropdownMenu.tsx       # Context menu with items, checkbox items, radio items, sub-menus
│   │   ├── Tooltip.tsx            # Tooltip
│   │   ├── Avatar.tsx             # Avatar with fallback
│   │   ├── Switch.tsx             # Toggle switch
│   │   ├── Checkbox.tsx           # Checkbox
│   │   ├── Separator.tsx          # Separator
│   │   ├── ScrollArea.tsx         # Scrollable area
│   │   ├── Progress.tsx           # Progress bar
│   │   ├── AlertDialog.tsx        # Confirmation dialog
│   │   └── Popover.tsx            # Popover
│   ├── charts/                    # Recharts-based chart components
│   │   └── Charts.tsx            # TimeSeriesChart, BarChartComponent, PieChartComponent, MetricCard, StatGrid
│   └── ...                        # Feature-specific (dashboard, layout)
├── lib/
│   ├── utils/index.ts               # Shared utility functions (formatNumber, cn, debounce, formatDate, etc.)
│   ├── utils/export.ts              # Export helper for CSV/JSON
│   ├── auth.ts                     # Better Auth config
│   ├── auth-client.ts              # Better Auth client (browser)
│   ├── db.ts                       # Drizzle database client
│   └── effect/                     # Effect functional utilities
│       ├── runtime.ts              # Effect runtime (CanopyRuntime)
│       ├── db.ts                   # Db layer (Effect-compatible)
│       ├── errors.ts               # Domain errors
│       └── domain.ts               # Domain types
└── hooks/
    ├── use-toast.tsx               # Toast hook + Radix UI components
    └── use-analytics.ts            # (future) analytics data fetching hook

## Key Patterns

### Server-Rendered Pages + Client Interactive Components
Every analytics page follows this split pattern:

1. **Server page** (`page.tsx`): resolves auth, fetches site, renders the client component
2. **Client component** (`*.tsx`): fetches data from `/api/analytics/*` API routes

Example:
```tsx
// app/dashboard/pages/page.tsx
import { resolveSites } from '@/lib/resolve-sites';
import { DashboardPages } from '../Pages';

export default async function PagesPage({ searchParams }) {
  const resolved = await resolveSites(params.site);
  return <DashboardPages siteId={current.id} />;
}

// app/dashboard/Pages.tsx (client component)
'use client';
// fetches from /api/analytics/top-pages, /api/analytics/events
```

### Data Fetching (API Layer)
All analytics queries go through `/api/analytics/*` REST endpoints:
- `GET /api/analytics/overview?siteId=...&range=7d` — aggregated stats
- `GET /api/analytics/timeseries?siteId=...&range=7d&interval=hour` — chart data
- `GET /api/analytics/top-pages?siteId=...&range=7d&limit=20` — top pages
- `GET /api/analytics/top-referrers?siteId=...&range=7d` — top referrers
- `GET /api/analytics/top-countries?siteId=...&range=7d` — top countries
- `GET /api/analytics/realtime?siteId=...&window=60` — live visitors
- `GET /api/analytics/events?siteId=...&range=7d&limit=100` — event log (paginated)
- `GET /api/analytics/export?siteId=...&format=csv|json` — export download

All endpoints:
- Auth-protected (Better Auth session)
- Workspace-scoped (filter by active organization)
- Use Effect for structured error handling
- Respect `respectDnt` and `sampleRate` options (applied in client SDK)

### Utilities (`lib/utils/`)
- `cn(...)` — clsx + tailwind-merge for className merging
- `formatNumber(n)` — compact number formatting (1.2K, 5M)
- `formatDuration(ms)` — human-readable duration
- `formatDate(d)`, `formatDateTime(d)` — date formatting
- `formatRelativeTime(d)` — relative time ("5m ago")
- `debounce`, `throttle` — rate limiting
- `exportAnalytics({ siteId, range, format })` — triggers download

### UI Components (`components/ui/`)
shadcn/ui-style components with consistent dark theme. All support `cn()` for custom classes.

### Error Handling
- `useToast` returns `{ toast, toasts }` for notifications
- `DashboardError` component for error boundaries
- All fetches have `try/catch` with meaningful error messages

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CANOPY_URL=http://localhost:3002
BETTER_AUTH_SECRET=...
```

## Build & Test

```bash
pnpm install
pnpm --filter @wnstn/canopy-client build
pnpm --filter @wnstn/canopy test          # SDK tests
pnpm --filter @wnstn/canopy/nextjs build # Next.js SDK build
```

## Design Decisions

1. **Why first-party tracking?** — Events POST to `/api/canopy/event` on the same origin, not third-party endpoints. More reliable, privacy-preserving, GDPR-friendly.

2. **Why Effect instead of async/await?** — Effect provides structured error handling, resource safety, and testability. The `CanopyRuntime` is the single point of entry.

3. **Why separate API routes for each query?** — RESTful, cache-friendly, and easier to modify individually. The overview endpoint aggregates everything in one call for fast page loads.

4. **Why client-side fetching with React hooks instead of server data loaders?** — Enables streaming, instant UI updates, and live re-fetching without server roundtrips for each interaction.

5. **Why the dark theme is the only option?** — Canopy is built for engineers who live in terminal/themes. Dark mode is the default product experience.
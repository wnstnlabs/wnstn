# @wnstn/canopy

Safest & smallest privacy-first analytics — **< 2kb gzipped**, cookieless by default, no fingerprinting, respects DNT.

Open-source tracker for [Canopy](https://github.com/winston/wnstn) — self-hostable, no cookies unless you opt in.

## Install

```bash
pnpm add @wnstn/canopy
```

## CDN (1 line — recommended)

```html
<script
  src="https://your-canopy.app/p.js"
  data-site-id="canopy_xxx"
  async
></script>
```

That's it. Pageviews + outbound clicks tracked automatically. No cookies, no localStorage.

## NPM — vanilla

```ts
import { initCanopy } from '@wnstn/canopy';

initCanopy({ siteId: 'canopy_xxx' });

// custom events
import { track } from '@wnstn/canopy';
track('signup', { plan: 'pro' });
```

## Next.js — `wnstn/canopy/nextjs`

```tsx
// app/layout.tsx
import { CanopyProvider } from '@wnstn/canopy/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CanopyProvider siteId={process.env.NEXT_PUBLIC_CANOPY_SITE_ID!} />
        {children}
      </body>
    </html>
  );
}

// any client component
'use client';
import { useCanopyTrack } from '@wnstn/canopy/nextjs';

function Pricing() {
  const { track } = useCanopyTrack();
  return <button onClick={() => track('click_pricing')}>Upgrade</button>;
}
```

No extra install — `nextjs` is a **subpath export** of `@wnstn/canopy`:

```ts
import { CanopyProvider } from '@wnstn/canopy/nextjs';
```

## Why private, safe, small

- **No cookies, no storage** — session is in-memory `randomUUID` per tab, gone on close
- **Respects DNT** + bot filtering + `file://` blocked
- **Beacon-first** — `navigator.sendBeacon` with `fetch keepalive` fallback, `credentials: 'omit'`
- **No PII** — only `url`, `referrer`, `title`, `viewport`, `props` you explicitly pass; IP hashed server-side
- **SPA aware** — patches `pushState`/`replaceState`, listens `popstate`/`hashchange`
- **Sample / opt-out** — `sampleRate`, `respectDnt`, `disableOutbound`

## Options

```ts
initCanopy({
  siteId: 'canopy_xxx',
  endpoint: 'https://your-canopy.app/api/canopy/event', // optional
  env: 'production',
  respectDnt: true, // default true
  sampleRate: 1,
  props: { app: 'marketing' },
});
```

## Security & compliance

- GDPR-friendly cookieless mode (no consent banner needed in most jurisdictions — confirm with counsel)
- CSP friendly: only `POST` to your `endpoint`; no `eval`, no inline styles, no third-party
- Open source — audit `packages/canopy/src`

## License

MIT

# @wnstn/canopy-nextjs

React / Next.js integration for [Canopy](https://github.com/winston/wnstn) — a context provider, hooks, and SPA-aware pageviews on top of the `@wnstn/canopy` core tracker (which this package depends on for you).

Privacy-first: cookieless, DNT aware, no fingerprinting, no browser storage.

## Install

```bash
pnpm add @wnstn/canopy-nextjs
```

## Quick start

```tsx
// app/layout.tsx
import { CanopyProvider } from '@wnstn/canopy-nextjs';

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
```

The provider initializes the tracker, sends the first pageview, and keeps pageviews in sync with App Router navigation.

## Track events

```tsx
'use client';
import { useCanopyTrack } from '@wnstn/canopy-nextjs';

function Pricing() {
  const { track } = useCanopyTrack();
  return <button onClick={() => track('checkout_started', { plan: 'pro' })}>Upgrade</button>;
}
```

## Hooks

| Hook | Returns |
| - | - |
| `useCanopyTrack()` | `track(name, props?)` |
| `useCanopyPageview()` | `pageview(props?)` |
| `useCanopyIdentify()` | `identify(props)` |
| `useCanopyReset()` | `reset()` |
| `useCanopyInstance()` | All methods + `options` |
| `useCanopy()` | Raw instance or `null` |
| `useCanopyInitialized()` | `boolean` |
| `useCanopyOptions()` | Current options or `null` |
| `useCanopyFlush()` | `() => void` — flush pre-init queue |

`CanopyProvider` and `CanopyScript` accept the full `CanopyOptions` object (plus `scriptSrc` on the provider). See the core package docs for the complete list: `siteId`, `endpoint`, `env`, `respectDnt`, `sampleRate`, `props`, `debug`, `hooks`, and more.

## License

MIT

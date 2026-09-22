# Canopy SDK

Production-grade, privacy-first analytics SDK. Cookieless by default, DNT aware, GDPR friendly, <2kb minified.

## Packages

```
packages/
├── canopy/           # Core tracker — vanilla JS, works everywhere
│   ├── src/
│   │   ├── types.ts         # All TypeScript interfaces
│   │   ├── index.ts         # Main tracker: initCanopy, createCanopy, track, pageview, identify
│   │   ├── script.ts        # Public /p.js route handler (served first-party)
│   │   └── index.test.ts    # Vitest unit tests
│   ├── vite.config.ts       # Vite build config
│   └── tsup.config...      # Alternate tsup config
│
└── canopy/nextjs/    # React/Next.js wrapper
    ├── src/
    │   └── index.tsx        # CanopyProvider, useCanopy, useCanopyTrack, useCanopyIdentify, etc.
    ├── vite.config.ts
    └── ...
```

## SDK Philosophy (from the Article)

1. **Factory functions over constructors** — `createCanopy()` not `new Canopy()`
2. **Custom errors with helpers** — `CanopyError.isConfigError()`, `.isNetworkError()`, `.isValidationError()`
3. **Hooks interceptors** — `beforeSend`, `afterSend`, `onError` for cross-cutting concerns
4. **Bundle size matters** — <2kb minified, tree-shakeable, no runtime deps beyond `effect`
5. **Types are documentation** — every option has JSDoc, literal unions for status/type fields
6. **Helper functions** — encode best practices (e.g., `trackEvent` wraps `track`)

## API Surface

### Vanilla (`@wnstn/canopy`)

```ts
import { initCanopy, createCanopy, track, pageview, identify, reset,
         CanopyError } from '@wnstn/canopy'

// Factory pattern — recommended
const canopy = createCanopy({ siteId: 'abc', debug: true })
canopy.track('signup', { plan: 'pro' })

// Global queue — call before init
track('pageview')  // queued, fires after init
initCanopy({ siteId: 'abc' })  // flushes queue

// Custom error handling
try { ... } catch (e) {
  if (e instanceof CanopyError && e.isConfigError()) { /* handle */ }
}
```

### Next.js (`@wnstn/canopy/nextjs`)

```tsx
import {
  CanopyProvider, CanopyScript,
  useCanopy, useCanopyInstance, useCanopyTrack, useCanopyPageview,
  useCanopyIdentify, useCanopyReset, useCanopyInitialized
} from '@wnstn/canopy/nextjs'

// Layout — required once
<CanopyProvider siteId="abc" debug={process.env.NODE_ENV === 'development'} />

// Any component
const { track } = useCanopyTrack()
track('checkout', { value: 99 })

// Full instance access
const { track, pageview, identify, reset, setDefaultProps, options } = useCanopyInstance()
```

### Options (all optional except siteId)

```ts
interface CanopyOptions {
  siteId: string          // required — your Canopy site ID
  endpoint?: string      // default: /api/canopy/event
  env?: string           // production, development
  debug?: boolean        // console logging
  respectDnt?: boolean   // default: true
  sampleRate?: number    // 0-1, default 1 — sample % of events
  props?: Record<string, unknown>  // default props for all events
  manualPageview?: boolean  // disable auto pageview
  disableOutbound?: boolean // disable outbound link tracking
  hooks?: CanopyHooks    // beforeSend, afterSend, onError interceptors
}
```

### Hooks

```ts
interface CanopyHooks {
  beforeSend?: (event) => event | false   // modify or cancel event
  afterSend?: (event, response) => void   // post-send callback
  onError?: (event, error) => void        // on send failure
}
```

### Helpers (high-level APIs)

```ts
trackEvent('checkout', { plan: 'pro' })                    // track custom
trackPageview({ path: '/pricing', title: 'Pricing' })      // track pageview
trackIdentify({ userId: '123', plan: 'pro' })              // identify user
setDefaultProps({ userId: '123' })                         // persistent props
reset()                                                    // reset session
flushQueue()                                               // flush pending queue
isInitialized()                                            // check init state
getOptions()                                               // current options
getSessionIdPublic()                                       // current session ID
```

## Build

```bash
pnpm --filter @wnstn/canopy build         # ESM + CJS
pnpm --filter @wnstn/canopy/nextjs build  # ESM + CJS
pnpm --filter @wnstn/canopy test         # Vitest
```

## Event Payload

```json
{
  "v": "0.1.0",
  "s": "canopy_example_com",
  "n": "pageview",
  "u": "https://example.com/pricing",
  "sid": "uuid",
  "r": "https://google.com",
  "p": "/pricing",
  "t": "Pricing — Example",
  "w": 1440,
  "props": { "utm_source": "newsletter" },
  "ts": 1700000000000
}
```

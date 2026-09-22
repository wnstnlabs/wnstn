# wnstn — public packages & projects

Open-source monorepo for Winston public packages. Built with Turborepo.

## Structure

```
wnstn/
├── apps/
│   └── canopy/          # Analytics platform — Next.js + better-auth
├── packages/
│   ├── canopy/          # @wnstn/canopy — < 2kb privacy-first script
│   │   └── nextjs       # @wnstn/canopy/nextjs — Next.js wrapper
│   ├── ui/              # Shared UI primitives
│   ├── eslint-config/   # Shared ESLint config
│   └── typescript-config/ # Shared TS config
```

## Apps

### Canopy — Privacy-first analytics

- **Marketing + Dashboard** in `apps/canopy`
- **Script** in `packages/canopy` — ships as `https://canopy.[domain]/p.js` and via npm `import { canopy } from '@wnstn/canopy'`
- **Next.js** via `import { CanopyProvider } from '@wnstn/canopy/nextjs'`
- **Auth**: Next.js + `better-auth` standalone. Winston SSO is **optional** via OIDC (genericOAuth). Self-hosting Canopy does NOT require Winston.

> See `apps/canopy/README.md` for SSO wiring.

## Quick start

```bash
pnpm install
pnpm dev          # all apps
pnpm --filter @wnstn/canopy dev
```

## Winston ↔ Canopy SSO (optional)

Canopy can be configured to allow "Continue with Winston" without coupling:

- **Winston** acts as OIDC Provider (`better-auth` `oidcProvider` plugin)
- **Canopy** acts as OIDC Client (`genericOAuth` provider id `winston`)

Neither app breaks if the other is absent. See `apps/canopy/lib/auth/winston.ts`.

## Packages

- `@wnstn/canopy` — safe, tiny, cookieless-by-default tracker (core, framework-agnostic)
- `@wnstn/canopy/nextjs` — Next.js/React bindings (subpath export, no extra install)
- `@wnstn/ui` — shared components

import Link from 'next/link';
import { DocsShell, PageTitle, Section, P, C, Sub, CodeWindow, DataTable, Callout, CTA } from '../_components';

export default function SelfHostPage() {
  return (
    <DocsShell>
      <PageTitle title="Self-hosting">
        Canopy is a monorepo of ordinary Node packages: a Next.js dashboard, a Postgres database managed with
        Drizzle, and a tiny tracker that the dashboard serves from its own origin. There is no special runtime and
        no vendor lock-in — if you can run Next.js and Postgres, you can run Canopy, and every byte of analytics
        data lands in a database you own.
      </PageTitle>

      <div className="mt-12 space-y-16">
        <Section n="1" title="Prerequisites">
          <DataTable
            columns={['Requirement', 'Notes']}
            firstColMono={false}
            rows={[
              ['Node.js 20+', 'Any LTS release the Next.js version supports.'],
              ['pnpm 9+', 'The monorepo uses pnpm workspaces and Turborepo.'],
              ['PostgreSQL 14+', 'The only stateful dependency. Managed or self-hosted both work.'],
            ]}
          />
        </Section>

        <Section n="2" title="Set up the project">
          <P>Clone the repository and install workspace dependencies:</P>
          <CodeWindow label="terminal" tone="muted" code={`git clone https://github.com/winston/wnstn.git
cd wnstn
pnpm install`} />
          <P>Copy the environment template and fill in the two required values:</P>
          <CodeWindow label="terminal + .env" tone="muted" code={`cp apps/canopy/.env.example apps/canopy/.env

DATABASE_URL=postgresql://user:pass@host:5432/canopy
BETTER_AUTH_SECRET=<generate-a-long-random-string>`} />
          <P>
            <C>DATABASE_URL</C> points at your Postgres instance and <C>BETTER_AUTH_SECRET</C> signs session
            cookies — generate it with <C>openssl rand -base64 32</C>. Everything else in the table below has a
            working default for local development but deserves a look before going live.
          </P>
          <Sub>Environment variables</Sub>
          <DataTable
            columns={['Variable', 'Required', 'Description']}
            rows={[
              ['DATABASE_URL', <span className="text-teal-400">yes</span>, 'Postgres connection string.'],
              ['BETTER_AUTH_SECRET', <span className="text-teal-400">yes</span>, 'Signing secret for auth sessions. Use 32+ random chars in production.'],
              ['BETTER_AUTH_URL', 'no', <>Canonical origin for auth. Defaults to <C>NEXT_PUBLIC_CANOPY_URL</C>, then <C>http://localhost:3002</C>.</>],
              ['NEXT_PUBLIC_CANOPY_URL', 'no', <>Public origin of your Canopy instance — used in install snippets and auth. Default <C>http://localhost:3002</C>.</>],
              ['NEXT_PUBLIC_CANOPY_SITE_ID', 'no', <>Site ID used when Canopy tracks its own dashboard. Default <C>canopy_dashboard</C> in development.</>],
              ['CANOPY_IP_SALT', 'no', <>Salt for IP hashing. Defaults to a dev value — always set a strong one in production (see <Link href="/docs/privacy" className="text-rose-400 underline underline-offset-2">privacy</Link>).</>],
              ['WINSTON_OIDC_ISSUER', 'no', 'Optional SSO — enables OIDC sign-in when set together with the two vars below.'],
              ['WINSTON_OIDC_CLIENT_ID', 'no', 'OIDC client ID.'],
              ['WINSTON_OIDC_CLIENT_SECRET', 'no', 'OIDC client secret.'],
            ]}
          />
        </Section>

        <Section n="3" title="Build and migrate">
          <P>
            Build the tracker first. The dashboard serves <C>/p.js</C> from the built SDK output, and without this
            step it falls back to a minimal inline tracker (pageviews only, no custom events):
          </P>
          <CodeWindow label="terminal" tone="muted" code={`pnpm --filter @wnstn/canopy build`} />
          <P>Then create and apply the database schema with Drizzle's migrations:</P>
          <CodeWindow label="terminal" tone="muted" code={`pnpm --filter @wnstn/canopy-client db:generate   # write migration SQL from the schema
pnpm --filter @wnstn/canopy-client db:migrate    # apply it to DATABASE_URL`} />
          <Callout label="upgrading">
            On update: <C>git pull</C>, <C>pnpm install</C>, rebuild the tracker, and run <C>db:generate</C> +{' '}
            <C>db:migrate</C> again. Migrations are plain SQL files in <C>apps/canopy/drizzle/</C> — review them
            like any other change.
          </Callout>
        </Section>

        <Section n="4" title="Run it">
          <P>For development, the root command starts everything — dashboard on port 3002 plus SDK watch mode:</P>
          <CodeWindow label="terminal" tone="muted" code={`pnpm dev        # dashboard → http://localhost:3002`} />
          <P>
            For production, build and start the dashboard the standard Next.js way. Any Node host works — a VM, a
            container, or a platform like Vercel:
          </P>
          <CodeWindow label="terminal" tone="muted" code={`pnpm --filter @wnstn/canopy-client build
pnpm --filter @wnstn/canopy-client start`} />
        </Section>

        <Section n="5" title="How the script is served">
          <P>
            The tracker lives at <C>/p.js</C> on your Canopy origin — a rewrite to an internal route that reads the
            built SDK, sets a long cache window (5 minutes client-side, an hour at the edge, with stale-while-revalidate),
            and never 404s: if the dist output is missing, a minimal fallback tracker is served instead. Verify
            which one you are getting with the <C>X-Canopy-Source</C> response header — <C>dist</C> is the full
            tracker, <C>fallback</C> means you skipped the SDK build.
          </P>
          <P>
            Keep the tracker on the same origin as your sites when you can (via reverse proxy) for the cleanest
            first-party setup. Cross-origin also works — the ingestion endpoint reflects any origin in CORS — but a
            proxy avoids the extra preflight entirely.
          </P>
          <CodeWindow label="reverse proxy (nginx)" tone="muted" code={`location /p.js {
    proxy_pass https://canopy.internal.your-app.com/p.js;
}
location /api/canopy/ {
    proxy_pass https://canopy.internal.your-app.com/api/canopy/;
}`} />
        </Section>

        <Section n="6" title="Deployment notes">
          <P>
            Country attribution reads platform headers: on Vercel it uses <C>x-vercel-ip-country</C>, on
            Cloudflare <C>cf-ipcountry</C>. Behind a plain reverse proxy there is no such header, so country shows
            as unknown — front Canopy with Vercel or Cloudflare if country data matters to you.
          </P>
          <P>
            Production behavior changes with <C>NODE_ENV=production</C>: unknown site IDs are rejected at
            ingestion instead of auto-created, so register each site in the dashboard (or via{' '}
            <C>POST /api/sites</C>) before pointing traffic at it.
          </P>
          <Sub>Production checklist</Sub>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-400">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-slate-300">1.</span> Strong <C>CANOPY_IP_SALT</C> — the default is for local development only, and rotating it re-pseudonymizes all future IP hashes.</div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-slate-300">2.</span> Unique <C>BETTER_AUTH_SECRET</C>, generated once and kept out of version control.</div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-slate-300">3.</span> <C>NEXT_PUBLIC_CANOPY_URL</C> and <C>BETTER_AUTH_URL</C> set to your real origin so snippets and auth redirects are correct.</div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-slate-300">4.</span> HTTPS in front of the dashboard — session cookies and <C>sendBeacon</C> payloads both expect it.</div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-slate-300">5.</span> Postgres backups — the <C>event</C> table is your analytics history; the export endpoint is a convenient extra copy.</div>
          </div>
        </Section>

        <Section n="7" title="Optional: SSO">
          <P>
            Setting all three <C>WINSTON_OIDC_*</C> variables enables OIDC single sign-on alongside email and
            password. Point the issuer at your identity provider, register <C>{`<your-origin>`}/api/auth/callback/winston</C>{' '}
            as the redirect URI, and the login page picks up the SSO option automatically. Leave them unset and the
            feature stays completely disabled.
          </P>
        </Section>
      </div>

      <CTA title="Own your analytics end to end" primary={{ href: '/docs/install', label: 'Quick start' }} secondary={{ href: '/docs/api', label: 'HTTP API' }}>
        Postgres, one Node process, and a script tag — that's the whole stack.
      </CTA>
    </DocsShell>
  );
}

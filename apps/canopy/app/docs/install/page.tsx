import Link from 'next/link';
import { DocsShell, PageTitle, Section, P, C, Sub, CodeWindow, Callout, CTA } from '../_components';

export default function InstallPage() {
  return (
    <DocsShell
      headerRight={
        <>
          <Link href="/docs" className="mono text-[12px] text-slate-400 hover:text-slate-100">← Docs</Link>
          <Link href="/onboarding" className="rounded-md bg-rose-500 text-white px-4 py-[7px] text-[12px] font-medium hover:bg-rose-400 transition shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">Start measuring</Link>
        </>
      }
    >
      <PageTitle title="Quick start">
        Canopy takes about a minute to install. Add your site, paste one script tag (or mount one React component),
        and pageviews start flowing to your own domain — no cookies, no consent banner, no third-party requests.
        This page covers the three install paths and how to verify data is arriving.
      </PageTitle>

      <div className="mt-12 space-y-12">
        <Section n="1" title="Add your site">
          <P>
            Open the dashboard and create a site for the domain you want to measure — for example <C>example.com</C>.
            Canopy normalizes the domain (lowercase, no protocol, no <C>www.</C>) and derives your site ID from it:
          </P>
          <CodeWindow label="site id" badge="auto-generated" tone="muted" code={`example.com  →  canopy_example_com`} />
          <P>
            The site ID is the only identifier the tracker needs. You can find it any time in your site settings,
            and it appears in the install snippets the dashboard generates for you.
          </P>
        </Section>

        <Section n="2" title="HTML script — any site">
          <P>
            This is the universal install. It works on plain HTML, WordPress, Webflow, Ghost, Rails, Astro, or any
            SPA framework — anywhere you can add a tag to the <C>{`<head>`}</C>. The script is under 2kb gzipped,
            loads async, and never blocks rendering:
          </P>
          <CodeWindow label="HTML • p.js" badge="async • <2kb" code={`<script
  src="https://your-canopy.app/p.js"
  data-site-id="canopy_example_com"
  async
></script>`} />
          <P>
            Replace <C>your-canopy.app</C> with the host where Canopy runs and <C>canopy_example_com</C> with your site ID.
            Once loaded, the script initializes itself: it sends a pageview on load, keeps sending pageviews as visitors
            navigate (including SPA route changes), and tracks clicks on outbound links. If Canopy runs on a different
            origin than your site, point events at it explicitly:
          </P>
          <CodeWindow label="cross-origin install" badge="data-endpoint" tone="muted" code={`<script
  src="https://canopy.your-app.com/p.js"
  data-site-id="canopy_example_com"
  data-endpoint="https://canopy.your-app.com/api/canopy/event"
  async
></script>`} />
          <Sub>Attributes</Sub>
          <P>The script reads its configuration from <C>data-*</C> attributes on the tag:</P>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-500">
                <th className="p-3 pl-0 mono">Attribute</th>
                <th className="p-3">Required</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr>
                <td className="p-3 pl-0 mono">data-site-id</td>
                <td className="p-3 text-teal-400">yes</td>
                <td className="p-3">Your site ID, e.g. <C>canopy_example_com</C>. Without it the script does nothing.</td>
              </tr>
              <tr>
                <td className="p-3 pl-0 mono">data-endpoint</td>
                <td className="p-3">no</td>
                <td className="p-3">Where events are POSTed. Defaults to <C>/api/canopy/event</C> on the serving origin.</td>
              </tr>
              <tr>
                <td className="p-3 pl-0 mono">data-env</td>
                <td className="p-3">no</td>
                <td className="p-3">Optional label attached to every event, e.g. <C>production</C> or <C>staging</C>.</td>
              </tr>
              <tr>
                <td className="p-3 pl-0 mono">data-respect-dnt</td>
                <td className="p-3">no</td>
                <td className="p-3">Set to <C>false</C> to track visitors with Do Not Track enabled. DNT is respected by default.</td>
              </tr>
              <tr>
                <td className="p-3 pl-0 mono">data-disable-outbound</td>
                <td className="p-3">no</td>
                <td className="p-3">Presence of the attribute disables automatic outbound click tracking.</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section n="3" title="Next.js — @wnstn/canopy-nextjs">
          <P>
            On Next.js, prefer the React SDK over the script tag. It ships as its own package (it depends on the
            core tracker for you) and adds a context provider, hooks, and SPA-aware pageviews wired into the App
            Router:
          </P>
          <CodeWindow label="terminal" badge="one dep" code={`npm i @wnstn/canopy-nextjs`} />
          <P>Wrap your root layout once — that single mount replaces the script tag entirely:</P>
          <CodeWindow label="app/layout.tsx" badge="app router" tone="muted" code={`import { CanopyProvider } from "@wnstn/canopy-nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CanopyProvider siteId={process.env.NEXT_PUBLIC_CANOPY_SITE_ID!} />
        {children}
      </body>
    </html>
  );
}`} />
          <P>
            The provider initializes the tracker on the client, sends the first pageview automatically, and keeps
            pageviews in sync as users navigate. From any client component, track events with the hook:
          </P>
          <CodeWindow label="any component" badge="client" tone="muted" code={`'use client';
import { useCanopyTrack } from "@wnstn/canopy-nextjs";

export function PricingButton() {
  const { track } = useCanopyTrack();
  return <button onClick={() => track("signup", { plan: "pro" })}>Upgrade</button>;
}`} />
          <Callout label="note">
            Hooks must run in client components — the tracker only exists in the browser. Server components keep
            rendering untouched; put tracking calls behind <C>'use client</C> or event handlers.
            Full provider options and the hook list live in the <Link href="/docs/sdk" className="text-rose-400 underline underline-offset-2">SDK reference</Link>.
          </Callout>
        </Section>

        <Section n="4" title="Vanilla JS — framework agnostic">
          <P>
            If you bundle your own JavaScript and don't want the script tag, install the core tracker and
            initialize it directly. Calls made before initialization are queued and replayed once the tracker starts,
            so import order never matters:
          </P>
          <CodeWindow label="vanilla" badge="npm i @wnstn/canopy" tone="muted" code={`import { createCanopy, track } from "@wnstn/canopy";

createCanopy({ siteId: "canopy_example_com" });

// anywhere in your app — even before createCanopy runs
track("checkout", { value: 49, currency: "USD" });`} />
        </Section>

        <Section n="5" title="Verify it works">
          <P>Data should appear within seconds of loading a page. Three quick checks:</P>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-400">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <span className="mono text-[11px] text-slate-300">1.</span> Open your site, then the browser network tab —
              you should see a request to <C>/api/canopy/event</C> returning <C>202</C>.
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <span className="mono text-[11px] text-slate-300">2.</span> Open <Link href="/dashboard" className="text-rose-400 underline underline-offset-2">Realtime</Link> —
              you'll see yourself as an active visitor almost immediately.
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <span className="mono text-[11px] text-slate-300">3.</span> Check <Link href="/dashboard" className="text-rose-400 underline underline-offset-2">Overview</Link> for
              pageviews, referrers, and the live visitor count.
            </div>
          </div>
          <Callout label="not seeing events?" tone="amber">
            The three usual suspects: the browser has Do Not Track enabled (Canopy drops events by default),
            an unknown site ID returns <C>404</C> in production, or an extension is blocking requests.
            The <Link href="/docs/api#errors" className="text-rose-400 underline underline-offset-2">API error table</Link> maps each status code to its cause.
          </Callout>
        </Section>

        <Section n="6" title="Add custom events when ready">
          <P>
            Pageviews and outbound clicks are automatic — everything else is one call away. Events carry arbitrary
            JSON properties that land in your database as JSONB, ready to filter in the event log:
          </P>
          <CodeWindow label="custom events" badge="props are yours" tone="muted" code={`track("signup", { plan: "pro", source: "header" });
track("checkout", { value: 49, currency: "USD" });
track("feature_used", { name: "export", format: "csv" });`} />
          <P>
            Recipes, naming rules, and server-side events are covered in the{' '}
            <Link href="/docs/events" className="text-rose-400 underline underline-offset-2">custom events guide</Link>.
          </P>
        </Section>
      </div>

      <CTA title="Ready to measure?" secondary={{ href: '/docs/api', label: 'Read API docs' }}>
        Create your first site, paste one line, see live visitors.
      </CTA>
    </DocsShell>
  );
}

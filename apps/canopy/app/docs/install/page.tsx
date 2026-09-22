import Link from 'next/link';

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 dark-grid opacity-[0.12]" />
        <div className="absolute inset-0 radial-vignette" />
      </div>

      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-[1160px] px-6 h-[56px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-[12px]">◯</span>
            <span className="font-semibold tracking-tight text-sm">canopy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/docs" className="mono text-[12px] text-zinc-400 hover:text-white">← Docs</Link>
            <Link href="/onboarding" className="rounded-full bg-white text-zinc-900 px-4 py-[7px] text-[12px] font-medium">Start measuring</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-6 py-16">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] leading-[1] text-white">Quick start</h1>
          <p className="mt-4 text-[15px] leading-7 text-zinc-400 max-w-[640px]">Get Canopy running in under a minute. One script, no cookies, instant data.</p>

          <div className="mt-12 space-y-12">
            <section>
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">1</span> HTML script — any site</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400">Works on WordPress, Webflow, Ghost, static HTML, SPA frameworks. Paste in <code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">{`<head>`}</code>.</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]"><span className="mono text-[10px] text-zinc-500">HTML • p.js</span><span className="mono text-[10px] text-emerald-400">async • 1.5kb</span></div>
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`<script
  src="https://your-canopy.app/p.js"
  data-site-id="canopy_example_com"
  async
></script>`}</pre>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-zinc-500">Replace <code className="bg-white/[0.06] border border-white/[0.06] px-1 py-0.5 rounded text-zinc-300">data-site-id</code> with your site ID from the dashboard.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">2</span> Next.js — wnstn/canopy/nextjs</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400">Subpath export from <code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">@wnstn/canopy</code> — no extra install.</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]"><span className="mono text-[10px] text-zinc-500">npm i @wnstn/canopy/nextjs</span><span className="mono text-[10px] text-emerald-400">one dep</span></div>
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`npm i @wnstn/canopy/nextjs`}</pre>
              </div>
              <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]"><span className="mono text-[10px] text-zinc-500">app/layout.tsx</span><span className="mono text-[10px] text-zinc-600">app router</span></div>
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`import { CanopyProvider } from "@wnstn/canopy/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CanopyProvider siteId={process.env.NEXT_PUBLIC_CANOPY_SITE_ID!} />
        {children}
      </body>
    </html>
  );
}`}</pre>
              </div>
              <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="h-8 flex items-center justify-between px-3 border-b border-white/[0.06] bg-white/[0.02]"><span className="mono text-[10px] text-zinc-500">any component</span><span className="mono text-[10px] text-zinc-600">client</span></div>
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`'use client';
import { useCanopyTrack } from "@wnstn/canopy/nextjs";

export function PricingButton() {
  const { track } = useCanopyTrack();
  return <button onClick={() => track("signup", { plan: "pro" })}>Upgrade</button>;
}`}</pre>
              </div>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">3</span> Vanilla JS — framework agnostic</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400">No React? No problem. Import the core tracker directly.</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`import { initCanopy, track } from "@wnstn/canopy";

initCanopy({ siteId: "canopy_example_com" });

// anywhere in your app
track("checkout", { value: 49, currency: "USD" });`}</pre>
              </div>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">4</span> Verify it works</h2>
              <div className="mt-4 space-y-3 text-[14px] leading-6 text-zinc-400">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-zinc-300">1.</span> Open your site in a browser</div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-zinc-300">2.</span> Open <Link href="/dashboard" className="text-emerald-400 underline underline-offset-2">Realtime</Link> — you&apos;ll see your visit instantly</div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mono text-[11px] text-zinc-300">3.</span> Check <Link href="/dashboard" className="text-emerald-400 underline underline-offset-2">Overview</Link> for pageviews, sources, live count</div>
              </div>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">5</span> Add custom events when ready</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400">Track sign-ups, checkouts, feature usage — typed, no setup.</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`track("signup", { plan: "pro", source: "header" });
track("checkout", { value: 49, currency: "USD" });
track("feature_used", { name: "export", format: "csv" });`}</pre>
              </div>
            </section>
          </div>

          <div className="mt-12 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161618] to-[#0a0a0c] p-8 md:p-10 text-center">
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.02em] text-white">Ready to measure?</h2>
            <p className="mt-2 text-[14px] text-zinc-400">Create your first site, paste one line, see live visitors.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/onboarding" className="rounded-full bg-white text-zinc-900 px-6 py-3 text-sm font-medium">Start for free</Link>
              <Link href="/docs/api" className="rounded-full border border-white/[0.12] px-6 py-3 text-sm mono text-zinc-300 hover:bg-white/[0.06]">Read API docs</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
import Link from 'next/link';

export default function APIPage() {
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
            <Link href="/dashboard" className="rounded-full bg-white text-zinc-900 px-4 py-[7px] text-[12px] font-medium">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1160px] px-6 py-16">
        <div className="max-w-[800px]">
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] leading-[1] text-white">HTTP API</h1>
          <p className="mt-4 text-[15px] leading-7 text-zinc-400 max-w-[640px]">Simple REST endpoints. No API keys for ingestion — first-party by design.</p>

          <div className="mt-12 space-y-16">
            <section id="ingest">
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">1</span> Ingest events</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400"><code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">POST /api/canopy/event</code> — accepts single or batch events. No auth, first-party only.</p>

              <h3 className="mt-4 mono text-[11px] tracking-widest text-zinc-500 uppercase">Request</h3>
              <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`POST /api/canopy/event
Content-Type: application/json

{
  "s": "canopy_example_com",  // site ID (required)
  "n": "pageview",            // event name (required)
  "u": "https://example.com/pricing",
  "p": "/pricing",
  "r": "https://google.com",
  "t": "Pricing - Example",
  "w": 1440,
  "props": { "utm_source": "newsletter" },
  "sid": "abc123"             // optional session ID
}`}</pre>
              </div>

              <h3 className="mt-4 mono text-[11px] tracking-widest text-zinc-500 uppercase">Fields</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-zinc-500">
                      <th className="p-3 mono">Field</th>
                      <th className="p-3">Required</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr><td className="p-3 mono">s</td><td className="p-3 text-emerald-400">yes</td><td className="p-3">Site ID (e.g. <code>canopy_example_com</code>)</td></tr>
                    <tr><td className="p-3 mono">n</td><td className="p-3 text-emerald-400">yes</td><td className="p-3">Event name (<code>pageview</code>, <code>checkout</code>, etc.)</td></tr>
                    <tr><td className="p-3 mono">u</td><td className="p-3">no</td><td className="p-3">Full URL</td></tr>
                    <tr><td className="p-3 mono">p</td><td className="p-3">no</td><td className="p-3">Path (<code>/pricing</code>)</td></tr>
                    <tr><td className="p-3 mono">r</td><td className="p-3">no</td><td className="p-3">Referrer URL</td></tr>
                    <tr><td className="p-3 mono">t</td><td className="p-3">no</td><td className="p-3">Page title</td></tr>
                    <tr><td className="p-3 mono">w</td><td className="p-3">no</td><td className="p-3">Viewport width</td></tr>
                    <tr><td className="p-3 mono">props</td><td className="p-3">no</td><td className="p-3">Custom object (any JSON)</td></tr>
                    <tr><td className="p-3 mono">sid</td><td className="p-3">no</td><td className="p-3">Session ID (auto-generated if omitted)</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-4 mono text-[11px] tracking-widest text-zinc-500 uppercase">Response</h3>
              <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`202 Accepted
(empty body)`}</pre>
              </div>
              <p className="mt-2 text-[13px] text-zinc-500">Returns <code className="bg-white/[0.06] border border-white/[0.06] px-1 py-0.5 rounded text-zinc-300">202</code> immediately — event is queued. Batch multiple events by sending an array.</p>
            </section>

            <section id="stats">
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">2</span> Query stats</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400"><code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">GET /api/canopy/stats</code> — requires auth (dashboard session). Returns aggregated counts.</p>

              <h3 className="mt-4 mono text-[11px] tracking-widest text-zinc-500 uppercase">Query params</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-zinc-500"><th className="p-3 mono">Param</th><th className="p-3">Type</th><th className="p-3">Description</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr><td className="p-3 mono">site</td><td className="p-3">string</td><td className="p-3">Site ID (required)</td></tr>
                    <tr><td className="p-3 mono">range</td><td className="p-3">string</td><td className="p-3"><code>7d</code> (default) | <code>24h</code> | <code>30d</code></td></tr>
                    <tr><td className="p-3 mono">groupBy</td><td className="p-3">string</td><td className="p-3"><code>day</code> | <code>hour</code> | <code>path</code> | <code>referrer</code> | <code>event</code></td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-4 mono text-[11px] tracking-widest text-zinc-500 uppercase">Example response</h3>
              <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`GET /api/canopy/stats?site=canopy_example_com&range=7d

{
  "site": "canopy_example_com",
  "range": "7d",
  "totals": {
    "visitors": 12400,
    "pageviews": 28700,
    "events": 11200,
    "uniques": 8400
  },
  "series": [
    { "day": "2024-01-15", "visitors": 1800, "pageviews": 4200 },
    { "day": "2024-01-16", "visitors": 1920, "pageviews": 4500 }
  ],
  "topPaths": [
    { "path": "/", "views": 4200, "uniques": 3100 },
    { "path": "/pricing", "views": 2800, "uniques": 2100 }
  ],
  "topReferrers": [
    { "ref": "https://newsletter.example.com", "count": 1200 }
  ]
}`}</pre>
              </div>
            </section>

            <section id="webhooks">
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">3</span> Webhooks</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400">Subscribe to funnel drops, thresholds, anomalies. <code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">POST /api/canopy/webhooks</code> (auth required).</p>

              <h3 className="mt-4 mono text-[11px] tracking-widest text-zinc-500 uppercase">Event types</h3>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-[#0f0f12] p-4"><div className="mono text-[11px] text-emerald-400">funnel.drop</div><div className="mt-1 text-[13px] text-zinc-400">{'Funnel conversion drops > threshold'}</div></div>
                <div className="rounded-xl border border-white/[0.08] bg-[#0f0f12] p-4"><div className="mono text-[11px] text-amber-300">threshold.breach</div><div className="mt-1 text-[13px] text-zinc-400">Metric exceeds configured limit</div></div>
                <div className="rounded-xl border border-white/[0.08] bg-[#0f0f12] p-4"><div className="mono text-[11px] text-violet-400">anomaly.detected</div><div className="mt-1 text-[13px] text-zinc-400">Unusual traffic pattern detected</div></div>
                <div className="rounded-xl border border-white/[0.08] bg-[#0f0f12] p-4"><div className="mono text-[11px] text-emerald-400">site.verified</div><div className="mt-1 text-[13px] text-zinc-400">Domain verified via DNS</div></div>
              </div>

              <h3 className="mt-4 mono text-[11px] tracking-widest text-zinc-500 uppercase">Payload</h3>
              <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border)] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <pre className="mono text-[12px] leading-5 p-4 text-zinc-300 overflow-x-auto">{`{
  "event": "funnel.drop",
  "site": "canopy_example_com",
  "timestamp": "2024-01-15T14:32:00.000Z",
  "data": {
    "funnel": "checkout",
    "steps": ["view", "cart", "checkout"],
    "conversion": 0.021,
    "previous": 0.033,
    "drop": 0.36
  }
}`}</pre>
              </div>
            </section>

            <section id="verify">
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">4</span> Site verification</h2>
              <p className="mt-3 text-[14px] leading-6 text-zinc-400">Prove domain ownership via DNS TXT record. Unlocks <code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">verified</code> badge and webhook trust.</p>

              <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0f0f12] p-5">
                <div className="mono text-[11px] tracking-widest text-zinc-500 uppercase">Verify endpoint</div>
                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[#08080a] p-3">
                  <pre className="mono text-[12px] leading-5 text-zinc-300 overflow-x-auto">{`GET /api/verify?site=canopy_example_com

{
  "site": "canopy_example_com",
  "status": "pending",
  "record": "canopy-site=abc123xyz",
  "instructions": "Add TXT record @ with value above"
}`}</pre>
                </div>
                <p className="mt-3 mono text-[11px] text-zinc-500">After DNS propagates, re-check — status becomes <span className="text-emerald-400">verified</span> and badge appears on dashboard.</p>
              </div>
            </section>

            <section id="errors">
              <h2 className="text-[20px] font-semibold tracking-tight text-white flex items-center gap-2"><span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">5</span> Errors</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead><tr className="border-b border-white/[0.08] text-zinc-500"><th className="p-3 mono">Code</th><th className="p-3">Meaning</th></tr></thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr><td className="p-3 mono">400</td><td className="p-3">Missing required field (<code>s</code> or <code>n</code>)</td></tr>
                    <tr><td className="p-3 mono">404</td><td className="p-3">Unknown site ID</td></tr>
                    <tr><td className="p-3 mono">422</td><td className="p-3">Invalid JSON or field validation failed</td></tr>
                    <tr><td className="p-3 mono">429</td><td className="p-3">Rate limited (per-site, generous)</td></tr>
                    <tr><td className="p-3 mono">500</td><td className="p-3">Internal error — check logs</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="mt-16 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161618] to-[#0a0a0c] p-8 md:p-10 text-center">
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.02em] text-white">Start sending events</h2>
            <p className="mt-2 text-[14px] text-zinc-400">No API keys for ingestion. Just POST to your endpoint.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/onboarding" className="rounded-full bg-white text-zinc-900 px-6 py-3 text-sm font-medium">Create your site</Link>
              <Link href="/docs" className="rounded-full border border-white/[0.12] px-6 py-3 text-sm mono text-zinc-300 hover:bg-white/[0.06]">Back to docs</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
import Link from 'next/link';

export default function DocsIndexPage() {
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
            <Link href="/dashboard" className="mono text-[12px] text-zinc-400 hover:text-white">Dashboard</Link>
            <Link href="/login" className="rounded-full bg-white text-zinc-900 px-4 py-[7px] text-[12px] font-medium">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-6 py-16">
        <div className="text-center">
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] leading-[1] text-white">Documentation</h1>
          <p className="mt-3 text-[15px] leading-7 text-zinc-400 max-w-[640px] mx-auto">Get Canopy running in minutes. From script install to custom events and self-hosting.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Link href="/docs/install" className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-6 md:p-8 hover:border-white/[0.14] transition">
            <div className="size-10 rounded-xl bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">◯</div>
            <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">Quick start</h2>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">Paste one script, see visitors in seconds. npm + Next.js + vanilla examples.</p>
            <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-emerald-400">Start →</span>
          </Link>

          <Link href="/docs/api" className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-6 md:p-8 hover:border-white/[0.14] transition">
            <div className="size-10 rounded-xl bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">◯</div>
            <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">HTTP API</h2>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">Ingest events, query stats, webhooks. REST + JSON, no auth required for ingestion.</p>
            <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-emerald-400">Read API docs →</span>
          </Link>

          <Link href="/docs/self-host" className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-6 md:p-8 hover:border-white/[0.14] transition">
            <div className="size-10 rounded-xl bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">◯</div>
            <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">Self-host</h2>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">Deploy Canopy on your infra. Docker, database, env vars, migrations, SSL.</p>
            <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-emerald-400">Deploy guide →</span>
          </Link>

          <Link href="/docs/events" className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-6 md:p-8 hover:border-white/[0.14] transition">
            <div className="size-10 rounded-xl bg-white text-zinc-900 grid place-items-center text-[14px] font-semibold">◯</div>
            <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">Custom events</h2>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">Type-safe track(), funnels, retention. Props you control, no click-ops.</p>
            <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-emerald-400">Event guide →</span>
          </Link>
        </div>

        <div className="mt-16 border-t border-white/[0.06] pt-8">
          <h3 className="text-[16px] font-semibold tracking-tight text-white mono">Need help?</h3>
          <p className="mt-2 text-[14px] leading-6 text-zinc-400">GitHub issues, community, and support channels.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="https://github.com/winston/wnstn/issues" className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 mono text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-white">GitHub Issues</Link>
            <Link href="https://github.com/winston/wnstn/discussions" className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 mono text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-white">Discussions</Link>
            <Link href="https://github.com/winston/wnstn" className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 mono text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-white">Star on GitHub</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
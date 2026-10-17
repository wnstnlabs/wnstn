import Link from 'next/link';
import { DocsShell } from './_components';

export default function DocsIndexPage() {
  return (
    <DocsShell
      headerRight={
        <>
          <Link href="/dashboard" className="mono text-[12px] text-slate-400 hover:text-slate-100">Dashboard</Link>
          <Link href="/login" className="rounded-md bg-rose-500 text-white px-4 py-[7px] text-[12px] font-medium hover:bg-rose-400 transition shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">Sign in</Link>
        </>
      }
    >
      <div className="text-center">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] leading-[1] text-slate-100">Documentation</h1>
        <p className="mt-3 text-[15px] leading-7 text-slate-400 max-w-[640px] mx-auto">
          Everything you need to run Canopy: install the tracker in minutes, send the events you care about,
          query your data over HTTP, and self-host the whole stack on infrastructure you own.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <Link href="/docs/install" className="rounded-xl border border-white/[0.08] bg-[#12151d] p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.45)] hover:border-white/[0.14] transition">
          <div className="size-10 rounded-md bg-rose-500 text-white grid place-items-center text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">1</div>
          <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-slate-100">Quick start</h2>
          <p className="mt-2 text-[14px] leading-6 text-slate-400">
            From zero to live visitors. One script tag for any site, the React SDK for Next.js, and how to verify data is flowing.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-rose-400">Start here →</span>
        </Link>

        <Link href="/docs/events" className="rounded-xl border border-white/[0.08] bg-[#12151d] p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.45)] hover:border-white/[0.14] transition">
          <div className="size-10 rounded-md bg-rose-500 text-white grid place-items-center text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">2</div>
          <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-slate-100">Custom events</h2>
          <p className="mt-2 text-[14px] leading-6 text-slate-400">
            Track signups, checkouts, and feature usage with arbitrary JSON props. Naming rules, default props, PII scrubbing, and server-side events.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-rose-400">Event guide →</span>
        </Link>

        <Link href="/docs/api" className="rounded-xl border border-white/[0.08] bg-[#12151d] p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.45)] hover:border-white/[0.14] transition">
          <div className="size-10 rounded-md bg-rose-500 text-white grid place-items-center text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">3</div>
          <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-slate-100">HTTP API</h2>
          <p className="mt-2 text-[14px] leading-6 text-slate-400">
            The ingestion endpoint your events POST to, the authenticated analytics endpoints the dashboard uses, and site verification.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-rose-400">Read API docs →</span>
        </Link>

        <Link href="/docs/sdk" className="rounded-xl border border-white/[0.08] bg-[#12151d] p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.45)] hover:border-white/[0.14] transition">
          <div className="size-10 rounded-md bg-rose-500 text-white grid place-items-center text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">4</div>
          <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-slate-100">SDK reference</h2>
          <p className="mt-2 text-[14px] leading-6 text-slate-400">
            Every option, method, and hook on <span className="mono text-[12px]">@wnstn/canopy</span> and <span className="mono text-[12px]">@wnstn/canopy-nextjs</span> — under 2kb, no cookies.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-rose-400">API reference →</span>
        </Link>

        <Link href="/docs/self-host" className="rounded-xl border border-white/[0.08] bg-[#12151d] p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.45)] hover:border-white/[0.14] transition">
          <div className="size-10 rounded-md bg-rose-500 text-white grid place-items-center text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">5</div>
          <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-slate-100">Self-host</h2>
          <p className="mt-2 text-[14px] leading-6 text-slate-400">
            Run Canopy on your own infrastructure. Environment variables, database migrations, deployment, and a production checklist.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-rose-400">Deploy guide →</span>
        </Link>

        <Link href="/docs/privacy" className="rounded-xl border border-white/[0.08] bg-[#12151d] p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.45)] hover:border-white/[0.14] transition">
          <div className="size-10 rounded-md bg-rose-500 text-white grid place-items-center text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]">6</div>
          <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-slate-100">Privacy & compliance</h2>
          <p className="mt-2 text-[14px] leading-6 text-slate-400">
            Exactly what is collected, what never leaves the browser, how DNT is respected, and why Canopy works without a consent banner.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 mono text-[11px] text-rose-400">Privacy model →</span>
        </Link>
      </div>

      <div className="mt-16 border-t border-white/[0.06] pt-8">
        <h3 className="text-[16px] font-semibold tracking-tight text-slate-100 mono">Need help?</h3>
        <p className="mt-2 text-[14px] leading-6 text-slate-400">GitHub issues, community, and support channels.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="https://github.com/winston/wnstn/issues" className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 mono text-[12px] text-slate-300 hover:bg-white/[0.06] hover:text-slate-100">GitHub Issues</Link>
          <Link href="https://github.com/winston/wnstn/discussions" className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 mono text-[12px] text-slate-300 hover:bg-white/[0.06] hover:text-slate-100">Discussions</Link>
          <Link href="https://github.com/winston/wnstn" className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 mono text-[12px] text-slate-300 hover:bg-white/[0.06] hover:text-slate-100">Star on GitHub</Link>
        </div>
      </div>
    </DocsShell>
  );
}

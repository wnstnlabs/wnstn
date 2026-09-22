import Link from 'next/link';
import { DomainInput } from '@/components/domain-input';
import { MobileMenu } from '@/components/layout/MobileMenu';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; value?: string }>;
}) {
  const { error, value } = await searchParams;

  return (
    <main className="min-h-screen bg-[#050507] text-zinc-100 selection:bg-orange-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 dark-grid opacity-20" />
        <div className="absolute inset-0 radial-vignette" />
        <div className="absolute inset-0 h-[560px] opacity-20 pointer-events-none" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,77,0,0.05) 0 1px, transparent 1px 88px), linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }} />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050507]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-[1160px] px-6 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-[13px] tracking-tighter">◯</span>
            <span className="font-semibold tracking-tight text-[15px]">canopy</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-[10px] mono text-zinc-400">open source</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-zinc-400 mono">
            <Link href="#features" className="hover:text-white transition">Features</Link>
            <Link href="#install" className="hover:text-white transition">Install</Link>
            <Link href="#privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="https://github.com/winston/wnstn" className="inline-flex items-center gap-1.5 hover:text-white transition">
              <span className="size-3 rounded-full bg-white/20" /> GitHub
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-[13px] text-zinc-400 hover:text-white px-3 py-1.5 mono">log in</Link>
            <Link href="/onboarding" className="rounded-full bg-white text-zinc-900 px-5 py-[9px] text-[13px] font-medium hover:bg-zinc-100 transition">Start measuring</Link>
          </div>
          <MobileMenu />
        </div>
      </header>

      {/* HERO — clean, analytics-first */}
      <section className="mx-auto max-w-[900px] px-6 pt-20 md:pt-28 lg:pt-36 pb-16 md:pb-24 text-center">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[11px] mono text-zinc-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          No cookies • No tracking • You own the data
        </div>

        <h1 className="animate-fade-up-2 mt-8 text-[40px] sm:text-[52px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[0.9] text-white">
          Simple analytics
          <br />
          <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">that respects privacy.</span>
        </h1>

        <p className="animate-fade-up-3 mx-auto mt-6 max-w-[560px] text-[16px] md:text-[17px] leading-7 text-zinc-400">
          See where visitors come from, what they do, and where you lose them.
          <span className="hidden sm:inline"> Lightweight, self-hostable, and honest about data.</span>
        </p>

        <div className="animate-fade-up-4 mt-10">
          <DomainInput errorValue={error === 'invalid_domain' ? value ?? '' : null} />
          {error === 'invalid_domain' && (
            <p className="mt-3 text-xs text-red-400 text-center mono">enter a valid domain like example.com</p>
          )}
          <p className="mt-4 text-[11px] mono text-zinc-500">
            Free to start • No credit card • One line: <span className="text-zinc-300 bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5">&lt;script src=&quot;/p.js&quot; data-site-id=&quot;...&quot; /&gt;</span>
          </p>
        </div>

        {/* Dashboard preview — visual, not code */}
        <div className="animate-fade-up-4 mt-16 md:mt-20 mx-auto max-w-[760px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0c0f] shadow-[0_24px_64px_rgba(0,0,0,0.55)] text-left">
          <div className="flex items-center justify-between px-5 h-11 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-white/20" />
              <span className="mono text-[11px] text-zinc-400">yourdomain.com</span>
              <span className="hidden sm:inline-flex ml-2 items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 text-[10px] mono text-emerald-400">
                <span className="size-1 rounded-full bg-emerald-400 animate-pulse" /> 84 live
              </span>
            </div>
            <span className="mono text-[10px] text-zinc-500">Last 7 days</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
            <div className="px-5 py-4">
              <div className="mono text-[10px] text-zinc-500 uppercase tracking-wide">Visitors</div>
              <div className="text-[18px] font-semibold text-white mt-1.5">12.4k <span className="text-[11px] font-normal text-emerald-400">+12%</span></div>
            </div>
            <div className="px-5 py-4">
              <div className="mono text-[10px] text-zinc-500 uppercase tracking-wide">Pageviews</div>
              <div className="text-[18px] font-semibold text-white mt-1.5">28.7k</div>
            </div>
            <div className="px-5 py-4">
              <div className="mono text-[10px] text-zinc-500 uppercase tracking-wide">Sign-ups</div>
              <div className="text-[18px] font-semibold text-white mt-1.5">412 <span className="text-[11px] font-normal text-zinc-500">3.3%</span></div>
            </div>
          </div>
          <div className="grid md:grid-cols-[1.5fr_1fr]">
            <div className="p-5 border-r border-white/[0.06] hidden md:block">
              <div className="mono text-[10px] text-zinc-500 uppercase tracking-wide">Traffic — last 7 days</div>
              <svg viewBox="0 0 320 80" className="mt-4 w-full h-[80px]">
                <defs>
                  <linearGradient id="canopy-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 60 C 40 55, 70 30, 110 28 S 170 50, 210 38 S 260 60, 320 22" fill="none" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M0 60 C 40 55, 70 30, 110 28 S 170 50, 210 38 S 260 60, 320 22 L 320 80 L 0 80 Z" fill="url(#canopy-fill)" />
                <circle cx="110" cy="28" r="3" fill="#ff4d00" stroke="#0c0c0f" strokeWidth="1.5" />
              </svg>
              <div className="mt-3 flex justify-between mono text-[10px] text-zinc-600"><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div>
            </div>
            <div className="p-5">
              <div className="mono text-[10px] text-zinc-500 uppercase tracking-wide">Top pages</div>
              <div className="mt-4 space-y-3">
                {[
                  ['/', '4.2k', '38%'],
                  ['/pricing', '2.8k', '24%'],
                  ['/blog', '1.9k', '16%'],
                  ['/docs', '1.1k', '9%'],
                ].map(([path, views, share]) => (
                  <div key={path} className="flex items-center justify-between text-xs">
                    <span className="mono text-zinc-300">{path}</span>
                    <span className="flex items-center gap-3"><span className="text-zinc-400">{views}</span><span className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden hidden sm:block"><span className="block h-full bg-white" style={{ width: share }} /></span></span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 mono text-[11px] text-zinc-500">First-party only • Respects privacy • <span className="text-white">1.5kb</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider - breathing room */}
      <div className="mx-auto max-w-[1160px] px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* 01 — What you get, plain language */}
      <section id="features" className="mx-auto max-w-[1160px] px-6 py-20 md:py-28 scroll-mt-20">
        <div className="max-w-[720px]">
          <div className="flex items-baseline gap-4">
            <span className="text-[28px] font-semibold tracking-tighter text-white/10 mono">01</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[11px] mono tracking-widest text-[#ff4d00]">WHAT YOU GET</span>
          </div>
          <h2 className="mt-8 text-[28px] md:text-[36px] font-semibold tracking-[-0.03em] leading-[1] text-white">
            The essentials.<br />
            <span className="text-zinc-500">Without the baggage.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-zinc-400 max-w-[560px]">Everything you need to make good product decisions — and nothing that makes your visitors uncomfortable.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-7 md:p-8">
            <div className="size-8 rounded-lg bg-white text-zinc-900 grid place-items-center text-[12px]">○</div>
            <h3 className="mt-5 text-[15px] font-medium text-white">Visitors & pageviews</h3>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">See real traffic without cookies. Where people came from, what device, which pages.</p>
            <div className="mt-5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 mono text-[11px] text-zinc-500">/pricing → 2.8k views · 24%</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-7 md:p-8">
            <div className="size-8 rounded-lg bg-white text-zinc-900 grid place-items-center text-[12px]">↗</div>
            <h3 className="mt-5 text-[15px] font-medium text-white">Custom events</h3>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">Track sign-ups, checkouts, any action. Simple API, no complicated setup.</p>
            <div className="mt-5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 mono text-[11px] text-zinc-500">sign-up → 412 · conversion 3.3%</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-7 md:p-8">
            <div className="size-8 rounded-lg bg-white text-zinc-900 grid place-items-center text-[12px]">◎</div>
            <h3 className="mt-5 text-[15px] font-medium text-white">Live now</h3>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">See who’s on your site right now and what they’re looking at.</p>
            <div className="mt-5 flex items-center gap-2 mono text-[11px] text-zinc-500"><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> 84 visitors on site</div>
          </div>
        </div>
      </section>

      {/* 02 — How it works, no code */}
      <section id="install" className="mx-auto max-w-[1160px] px-6 py-12 md:py-16 scroll-mt-20">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-8 md:p-10 flex flex-col">
            <div className="flex items-baseline gap-3">
              <span className="text-[28px] font-semibold tracking-tighter text-white/10 mono">02</span>
              <span className="text-[11px] mono tracking-widest text-zinc-500">HOW IT WORKS</span>
            </div>
            <h3 className="mt-4 text-[20px] md:text-[22px] font-semibold tracking-tight text-white leading-tight">One line. Any site. Done in a minute.</h3>
            <p className="mt-3 text-[14px] leading-6 text-zinc-400">No dashboards to configure first. Paste one script and you’ll see visitors in seconds.</p>
            <div className="mt-8 grid gap-5">
              <div className="flex gap-4">
                <span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[11px] font-medium shrink-0">1</span>
                <div><div className="text-[14px] font-medium text-white">Add to your site</div><div className="text-[13px] leading-5 text-zinc-500 mt-1">Works on any site — Webflow, WordPress, Next.js, more.</div></div>
              </div>
              <div className="flex gap-4">
                <span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[11px] font-medium shrink-0">2</span>
                <div><div className="text-[14px] font-medium text-white">Visitors appear instantly</div><div className="text-[13px] leading-5 text-zinc-500 mt-1">No waiting, no manual page tagging. We handle pageviews automatically.</div></div>
              </div>
              <div className="flex gap-4">
                <span className="size-7 rounded-full bg-white text-zinc-900 grid place-items-center text-[11px] font-medium shrink-0">3</span>
                <div><div className="text-[14px] font-medium text-white">Add events when ready</div><div className="text-[13px] leading-5 text-zinc-500 mt-1">Start with pageviews, add custom tracking later — no rush.</div></div>
              </div>
            </div>
            <div className="mt-auto pt-10 flex gap-3 items-center">
              <Link href="/docs" className="rounded-full bg-white text-zinc-900 px-5 py-2.5 text-[13px] font-medium">See install guide</Link>
              <span className="text-[11px] mono text-zinc-600">1.5kb · loads in &lt;30ms</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f] p-8 md:p-10 flex flex-col justify-center">
            <div className="mono text-[11px] tracking-widest text-zinc-500 uppercase">You&apos;ll see in Canopy</div>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
                <span className="text-[14px] text-zinc-300">Where visitors come from</span>
                <span className="mono text-[11px] text-zinc-500">/blog → /pricing 38%</span>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
                <span className="text-[14px] text-zinc-300">What they click</span>
                <span className="mono text-[11px] text-emerald-400">sign-up 412</span>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
                <span className="text-[14px] text-zinc-300">Where you lose them</span>
                <span className="mono text-[11px] text-amber-300">checkout -51%</span>
              </div>
            </div>
            <p className="mt-6 text-[13px] leading-6 text-zinc-500">No complex funnels to build on day one. Start simple, go deeper when you’re ready.</p>
          </div>
        </div>
      </section>

      {/* 03 — Privacy + ownership, simple */}
      <section id="privacy" className="mx-auto max-w-[1160px] px-6 py-12 md:py-16 scroll-mt-20">
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-[#0f0f12] to-[#08080a] p-8 md:p-10 lg:p-12">
          <div className="flex items-baseline gap-3">
            <span className="text-[28px] font-semibold tracking-tighter text-white/10 mono">03</span>
            <span className="text-[11px] mono tracking-widest text-zinc-500">TRUST</span>
          </div>
          <h3 className="mt-4 text-[24px] md:text-[28px] font-semibold tracking-[-0.02em] text-white">Privacy you can stand behind.</h3>
          <p className="mt-3 text-[14px] md:text-[15px] leading-7 text-zinc-400 max-w-[640px]">Your visitors didn’t ask to be tracked across the web. We don’t. First-party only, no fingerprinting, and you can self-host if you want full control.</p>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 md:p-6">
              <div className="mono text-[11px] tracking-wide text-zinc-400">No cookie banner</div>
              <div className="mt-2 text-[14px] font-medium text-white">No pop-up needed</div>
              <div className="mt-2 text-[13px] leading-6 text-zinc-500">Cookieless by default. In most regions you don’t need to ask permission.</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 md:p-6">
              <div className="mono text-[11px] tracking-wide text-zinc-400">You own the data</div>
              <div className="mt-2 text-[14px] font-medium text-white">Stay on your domain</div>
              <div className="mt-2 text-[13px] leading-6 text-zinc-500">Events go to your site, not a third party. Export whenever you want.</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 md:p-6">
              <div className="mono text-[11px] tracking-wide text-zinc-400">Honest and small</div>
              <div className="mt-2 text-[14px] font-medium text-white">1.5kb script</div>
              <div className="mt-2 text-[13px] leading-6 text-zinc-500">Open source. Auditable. Does one thing well.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — still dev-friendly but plain language */}
      <section id="dx" className="mx-auto max-w-[1160px] px-6 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h3 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-white">Made for teams who care about craft</h3>
          <span className="mono text-[11px] tracking-wide text-zinc-500">Simple by default, powerful when needed.</span>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-7 md:p-8">
            <div className="text-[14px] font-medium text-white">For any stack</div>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">WordPress to Next.js. Paste a script or use the React provider — same data.</p>
            <div className="mt-5 mono text-[11px] text-zinc-500 border border-white/[0.06] rounded-lg bg-black/20 px-3 py-2">Any site · Webflow · Next.js · Remix</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-7 md:p-8">
            <div className="text-[14px] font-medium text-white">Shows what matters</div>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">Top pages, referrers, UTMs — the real reasons behind growth or churn.</p>
            <div className="mt-5 mono text-[11px] text-zinc-500 border border-white/[0.06] rounded-lg bg-black/20 px-3 py-2">Referrers · UTMs · Countries</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-7 md:p-8">
            <div className="text-[14px] font-medium text-white">Scales without drama</div>
            <p className="mt-2 text-[14px] leading-6 text-zinc-400">From hundreds to millions of events. Same setup, no migration.</p>
            <div className="mt-5 mono text-[11px] text-zinc-500 border border-white/[0.06] rounded-lg bg-black/20 px-3 py-2">Side project → scale — same app</div>
          </div>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
            <div className="text-[14px] font-medium text-white">Understand drop-offs</div>
            <p className="mt-2 text-[14px] leading-6 text-zinc-500">See where funnels break — pricing → checkout, sign-up → activation — in one view.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
            <div className="text-[14px] font-medium text-white">Get alerts</div>
            <p className="mt-2 text-[14px] leading-6 text-zinc-500">Get a webhook when a funnel drops more than you expect. No surprises.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
            <div className="text-[14px] font-medium text-white">Keep it honest</div>
            <p className="mt-2 text-[14px] leading-6 text-zinc-500">No sampled data, no “estimated” visitors. What you track is what you see.</p>
          </div>
        </div>
      </section>

      {/* Why it matters — plain, not technical */}
      <section className="mx-auto max-w-[1160px] px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-8 md:p-10">
            <div className="mono text-[11px] tracking-widest text-[#ff4d00]">WHY IT MATTERS</div>
            <h3 className="mt-3 text-[20px] font-semibold text-white leading-tight">See the leak before users tell you.</h3>
            <p className="mt-3 text-[14px] leading-7 text-zinc-400">When sign-ups dip, you’ll know same-day — which page, which source, and how much. Fix faster, with less guessing.</p>
            <div className="mt-6 rounded-xl bg-black/30 border border-white/[0.06] p-4 flex items-center justify-between">
              <span className="text-[14px] text-zinc-300">Checkout completion</span>
              <span className="mono text-[11px] text-amber-300">51% drop yesterday</span>
            </div>
            <div className="mt-3 text-[13px] text-zinc-500">We surface drops automatically — you choose where to be notified.</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 md:p-10">
            <div className="mono text-[11px] tracking-widest text-zinc-500">EXAMPLE</div>
            <div className="mt-5 space-y-3 mono text-[11px]">
              <div className="flex justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3"><span className="text-zinc-400">/pricing → visitors</span><span className="text-white">2.8k</span></div>
              <div className="flex justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3"><span className="text-zinc-400">Sign-ups</span><span className="text-amber-300">412 (−12%)</span></div>
              <div className="flex justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3"><span className="text-zinc-400">Source: newsletter</span><span className="text-emerald-400">+23%</span></div>
            </div>
            <p className="mt-5 text-[13px] leading-6 text-zinc-500">No SQL needed. Filters and funnels are buttons, not queries.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 rounded-2xl border border-white/[0.08] bg-[#0f0f12] p-8 md:p-10">
            <div className="mono text-[11px] tracking-widest text-zinc-500">PRIVACY · NO THEATRE</div>
            <h4 className="mt-3 text-[18px] font-semibold text-white">You don’t need to trade trust for insights.</h4>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 mono text-[11px]">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"><div className="text-zinc-300">No cookies</div><div className="text-zinc-500 mt-2 leading-5">No banner needed in most regions.</div></div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"><div className="text-zinc-300">No cross-site tracking</div><div className="text-zinc-500 mt-2 leading-5">We don’t follow people around the web.</div></div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"><div className="text-zinc-300">You can self-host</div><div className="text-zinc-500 mt-2 leading-5">Keep data in your own database if you prefer.</div></div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 mono text-[11px]">
            <div className="tracking-widest text-zinc-400">At a glance</div>
            <div className="mt-5 space-y-3 text-zinc-300"><div className="flex justify-between"><span>Script</span><span className="text-white">1.5kb</span></div><div className="flex justify-between"><span>Setup</span><span className="text-white">&lt;1 min</span></div><div className="flex justify-between"><span>Data</span><span className="text-white">Yours</span></div></div>
            <Link href="/docs/self-host" className="mt-6 inline-block text-zinc-300 underline underline-offset-4">Self-host guide →</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-6 pb-16 md:pb-24 pt-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161618] to-[#0a0a0c] p-10 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_0%,rgba(255,77,0,0.12),transparent)] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-[24px] md:text-[28px] font-semibold tracking-[-0.02em] text-white">See your traffic clearly.</h3>
              <p className="mt-2 text-[14px] leading-6 text-zinc-400">Set up in a minute. See visitors, pageviews, and conversions — without cookies.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/onboarding" className="rounded-full bg-white text-zinc-900 px-6 py-3 text-sm font-medium">Start for free</Link>
              <Link href="https://github.com/winston/wnstn" className="rounded-full border border-white/[0.12] px-6 py-3 text-sm mono text-zinc-300 hover:bg-white/[0.06]">View on GitHub</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto max-w-[1160px] px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 mono text-[11px] text-zinc-500">
            <span className="size-2 rounded-full bg-white" />
            <span>© {new Date().getFullYear()} Canopy — a wnstn project. MIT.</span>
            <span className="hidden sm:inline text-zinc-700">·</span>
            <span className="hidden sm:inline">npm i @wnstn/canopy/nextjs</span>
          </div>
          <div className="flex items-center gap-4 mono text-[11px] text-zinc-500">
            <Link href="/docs" className="hover:text-white">Docs</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/api/health" className="hover:text-white">Health</Link>
            <Link href="https://github.com" className="hover:text-white">npm</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

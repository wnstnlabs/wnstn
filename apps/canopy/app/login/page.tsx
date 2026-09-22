import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const winstonEnabled = Boolean(process.env.WINSTON_OIDC_ISSUER && process.env.WINSTON_OIDC_CLIENT_ID && process.env.WINSTON_OIDC_CLIENT_SECRET);
  const h = await headers();
  const session = await auth.api.getSession({ headers: h }).catch(() => null);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col lg:flex-row">
      {/* Left — distinctive, not boring */}
      <div className="relative hidden lg:flex lg:w-[48%] shrink-0 flex-col border-r border-white/[0.06] bg-[#08080a] overflow-hidden">
        <div className="absolute inset-0 dark-grid opacity-30" />
        <div className="absolute inset-0 radial-vignette opacity-80" />
        {/* large blurred orb */}
        <div className="absolute -top-24 -left-24 size-[520px] rounded-full bg-[#ff4d00]/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 size-[640px] rounded-full bg-violet-500/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex h-full flex-col p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-xs">◯</span>
            <span className="font-semibold tracking-tight text-sm">canopy</span>
            <span className="mono text-[10px] text-zinc-500 border border-white/[0.08] rounded-full px-2 py-0.5">analytics</span>
          </Link>

          <div className="mt-auto max-w-[420px]">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] mono text-zinc-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live • privacy-first since day one
            </div>
            <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.02em] leading-[1.05] text-white">Clarity without<br />compromise.</h2>
            <p className="mt-3 text-[13px] leading-6 text-zinc-400">The analytics you actually check. No cookies, no dark patterns. Just pageviews, events, and the truth.</p>

            {/* mini preview — unique, not just a form */}
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 backdrop-blur p-4">
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] text-zinc-500 uppercase tracking-wide">yourdomain.com</span>
                <span className="mono text-[10px] text-emerald-400">● 1,243 live</span>
              </div>
              <div className="mt-3 grid grid-cols-3 divide-x divide-white/[0.06] border-y border-white/[0.06] -mx-4 px-4 py-2.5">
                <div>
                  <div className="mono text-[10px] text-zinc-500">Visitors</div>
                  <div className="text-[15px] font-semibold text-white">8.2k</div>
                </div>
                <div className="pl-3">
                  <div className="mono text-[10px] text-zinc-500">Sign-ups</div>
                  <div className="text-[15px] font-semibold text-white">412</div>
                </div>
                <div className="pl-3">
                  <div className="mono text-[10px] text-zinc-500">Conversion</div>
                  <div className="text-[15px] font-semibold text-emerald-400">3.3%</div>
                </div>
              </div>
              <svg viewBox="0 0 340 44" className="mt-3 w-full h-10">
                <path d="M0 32 L40 28 L80 18 L120 22 L160 10 L200 18 L240 8 L280 14 L340 6" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1.4" />
                <path d="M0 32 L40 28 L80 18 L120 22 L160 10 L200 18 L240 8 L280 14 L340 6 L340 44 L0 44 Z" fill="white" fillOpacity="0.04" />
              </svg>
              <div className="mt-3 mono text-[10px] text-zinc-600 flex justify-between"><span>Top: /pricing 38%</span><span>— hashed IP, no cookies</span></div>
            </div>

            <p className="mt-6 mono text-[11px] text-zinc-600">“Finally analytics I’m not embarrassed to put on a pricing page.” — founder, early user</p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="h-14 px-6 flex items-center justify-between border-b border-white/[0.06] lg:border-none shrink-0">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-xs">◯</span>
            <span className="font-semibold text-sm">canopy</span>
          </Link>
          <span className="hidden lg:block mono text-[11px] text-zinc-500">Secure sign in • 1.5kb script • You own the data</span>
          <Link href="/" className="mono text-xs text-zinc-400 hover:text-white">← Back to site</Link>
        </header>

        <div className="flex-1 grid place-items-center px-6 py-10 relative">
          <div className="absolute inset-0 dark-grid opacity-[0.08] lg:hidden pointer-events-none" />
          <div className="w-full max-w-[420px] relative">
            <LoginForm winstonEnabled={winstonEnabled} />
            <p className="mt-6 text-center mono text-[11px] text-zinc-600 max-w-[420px] mx-auto">
              By signing in you agree to our Terms. Cookieless analytics — we practice what we measure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

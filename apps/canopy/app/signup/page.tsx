import Link from 'next/link';
import { SignupForm } from './SignupForm';

export default function SignupPage() {
  const winstonEnabled = Boolean(process.env.WINSTON_OIDC_ISSUER && process.env.WINSTON_OIDC_CLIENT_ID && process.env.WINSTON_OIDC_CLIENT_SECRET);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col lg:flex-row">
      {/* Left — distinctive */}
      <div className="relative hidden lg:flex lg:w-[48%] shrink-0 flex-col border-r border-white/[0.06] bg-[#08080a] overflow-hidden">
        <div className="absolute inset-0 dark-grid opacity-30" />
        <div className="absolute inset-0 radial-vignette opacity-80" />
        <div className="absolute -top-24 right-0 size-[520px] rounded-full bg-[#ff4d00]/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-[600px] rounded-full bg-emerald-500/10 blur-[140px]" />

        <div className="relative z-10 flex h-full flex-col p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-xs">◯</span>
            <span className="font-semibold tracking-tight text-sm">canopy</span>
          </Link>

          <div className="mt-auto max-w-[420px]">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] mono text-zinc-400">
              <span className="size-1.5 rounded-full bg-white animate-pulse" /> 30-second setup • free to start
            </div>
            <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.02em] leading-[1.05] text-white">Start measuring<br />in one line.</h2>
            <p className="mt-3 text-[13px] leading-6 text-zinc-400">Paste a script, see visitors in seconds. Add events when you’re ready — no lock-in.</p>

            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/80 backdrop-blur p-4 mono text-[11px]">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Install</span>
                <span className="text-white bg-white/10 rounded px-1.5 py-0.5">1.5kb</span>
              </div>
              <pre className="mt-2 text-zinc-300">{`<script
  src="/p.js"
  data-site-id="canopy_example"
  async
></script>`}</pre>
              <div className="mt-3 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 flex items-center justify-between">
                <span className="text-zinc-500">Next.js</span>
                <span className="text-white">npm i @wnstn/canopy/nextjs</span>
              </div>
            </div>
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
          <Link href="/login" className="mono text-xs text-zinc-400 hover:text-white">Already have an account? Log in</Link>
        </header>

        <div className="flex-1 grid place-items-center px-6 py-10 relative">
          <div className="absolute inset-0 dark-grid opacity-[0.08] lg:hidden pointer-events-none" />
          <div className="w-full max-w-[420px] relative">
            <SignupForm winstonEnabled={winstonEnabled} />
            <p className="mt-6 text-center mono text-[11px] text-zinc-600">No spam. No tracking. Just honest analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { OnboardingContent } from './OnboardingContent';

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ domain?: string; tab?: string }> }) {
  const { domain } = await searchParams;
  const clean = domain?.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '') ?? '';
  const siteId = clean ? `canopy_${clean.replace(/[^a-z0-9]/g, '_')}` : 'canopy_example_com';
  const displayDomain = clean || 'yourdomain.com';
  const origin = process.env.NEXT_PUBLIC_CANOPY_URL ?? 'http://localhost:3002';

  const snippet = `<script
  src="${origin}/p.js"
  data-site-id="${siteId}"
  async
></script>`;

  const npmSnippet = `import { CanopyProvider } from "@wnstn/canopy/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CanopyProvider siteId="${siteId}" />
        {children}
      </body>
    </html>
  );
}`;

  return (
    <div className="min-h-screen bg-[var(--background)] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 dark-grid opacity-[0.12]" />
        <div className="absolute inset-0 radial-vignette" />
      </div>

      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-[720px] px-6 h-[56px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-[12px] tracking-tighter">◯</span>
            <span className="font-semibold tracking-[-0.02em] text-[14px]">canopy</span>
            <span className="hidden sm:inline-flex mono text-[10px] tracking-wide text-zinc-500 border border-white/[0.08] rounded-full px-2 py-0.5 bg-white/[0.04]">onboarding</span>
          </Link>
          <Link href="/dashboard" className="mono text-[12px] text-zinc-400 hover:text-white border border-white/[0.08] rounded-full px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] transition">Skip to dashboard →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-8 md:py-10">
        <div className="canopy-card rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="relative p-6 md:p-8">
            <div className="inline-flex items-center gap-1.5 mono text-[11px] tracking-wide text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded-full px-2.5 py-1">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready to install
            </div>

            <OnboardingContent
              siteId={siteId}
              displayDomain={displayDomain}
              snippet={snippet}
              npmSnippet={npmSnippet}
            />
          </div>
        </div>

        <p className="mt-6 text-center mono text-[11px] text-zinc-500">
          Verification: open <code className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">https://{displayDomain}</code> and watch <Link href="/dashboard" className="underline underline-offset-4 text-zinc-300">Realtime</Link> — first-party endpoint, no ad-block tricks.
        </p>
      </main>
    </div>
  );
}
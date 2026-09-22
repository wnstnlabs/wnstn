import { submitDomainAction } from '@/app/actions';

/**
 * DomainInput — dark, dev-grade, terminal glow.
 * Server action validation, glass + mono + live pulse.
 */
export function DomainInput({ errorValue }: { errorValue?: string | null }) {
  return (
    <div className="w-full max-w-[720px] mx-auto">
      <form action={submitDomainAction} className="w-full">
        {/* Tabs — radio pills, peer-checked, no JS state */}
        <fieldset className="flex flex-wrap items-center justify-center gap-1.5 mb-3 border-0 p-0 m-0">
          <legend className="sr-only">Capture mode</legend>
          {(
            [
              ['pageviews', 'pageviews()'],
              ['events', 'track()'],
              ['funnels', 'funnel()'],
              ['realtime', 'live()'],
            ] as const
          ).map(([id, label]) => (
            <label key={id} className="cursor-pointer">
              <input type="radio" name="tab" value={id} defaultChecked={id === 'pageviews'} className="peer sr-only" />
              <span className="mono px-2 py-1 rounded-full border text-[10px] sm:text-[11px] font-medium bg-white/[0.04] text-zinc-400 border-white/[0.08] peer-checked:bg-white peer-checked:text-zinc-900 peer-checked:border-white hover:bg-white/[0.08] hover:text-zinc-200 transition inline-block">
                {label}
              </span>
            </label>
          ))}
          <span className="hidden sm:inline-flex ml-2 items-center gap-1.5 text-[11px] text-zinc-500 mono">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse inline-block" />
            no cookies · DNT
          </span>
        </fieldset>

        {/* Input — glass, stacked on mobile */}
        <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-white/[0.14] to-white/[0.04] pulse-glow">
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 rounded-[15px] bg-[#0f0f12] border border-white/[0.06] px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[15px] opacity-[0.04]">
              <div className="h-[1px] w-full bg-white absolute" style={{ animation: 'scanline 3s linear infinite' }} />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 pl-3 py-2 sm:py-0 mono w-full">
              <span className="text-zinc-500 text-sm hidden sm:inline">https://</span>
              <span className="text-emerald-400 text-sm">$</span>
              <input
                name="domain"
                defaultValue={errorValue ?? ''}
                placeholder="yourdomain.com"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                required
                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-zinc-600 text-white caret-orange-500"
                aria-label="Domain"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-medium px-5 py-3 sm:py-2.5 transition inline-flex items-center justify-center gap-1.5 mono"
            >
              <span>init</span>
              <span className="text-zinc-400">→</span>
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] mono text-zinc-500">
          <span className="hidden sm:inline">npm i @wnstn/canopy/nextjs</span>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <span>1.5kb gz · no fingerprinting · npm / cdn</span>
        </div>
      </form>
    </div>
  );
}

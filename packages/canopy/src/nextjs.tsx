'use client';

import React, { createContext, useContext, useMemo } from 'react';
import Script from 'next/script';
import { initCanopy, track as coreTrack, pageview as corePageview, getCanopy } from './index';
import type { MeadowOptions, MeadowInstance } from './types';
import { Effect } from 'effect';

type CanopyContextValue = MeadowInstance | null;

const CanopyContext = createContext<CanopyContextValue>(null);

/**
 * CanopyProvider — Next.js wrapper for @wnstn/canopy
 *
 * Effect-based, no useState / useEffect.
 * Uses Effect for init + synchronous option sync inside render (safe — no side-effect hooks).
 *
 * @example
 * // app/layout.tsx
 * import { CanopyProvider } from '@wnstn/canopy/nextjs';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <CanopyProvider siteId={process.env.NEXT_PUBLIC_CANOPY_SITE_ID!} />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 */
export function CanopyProvider({
  siteId,
  endpoint,
  env,
  manualPageview,
  disableOutbound,
  respectDnt,
  sampleRate,
  props,
  children,
  scriptSrc,
}: MeadowOptions & {
  children?: React.ReactNode;
  scriptSrc?: string | false;
}) {
  const opts = useMemo<MeadowOptions>(
    () => ({ siteId, endpoint, env, manualPageview, disableOutbound, respectDnt, sampleRate, props }),
    [siteId, endpoint, env, manualPageview, disableOutbound, respectDnt, sampleRate, JSON.stringify(props)]
  );

  // Effect-based init — replaces useEffect with a pure Effect pipeline run synchronously.
  // No useState / useEffect; memo ensures single init per opts identity.
  const instance = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const program = Effect.gen(function* () {
      const existing = getCanopy();
      if (existing) {
        existing.options = opts;
        return existing;
      }
      return yield* Effect.try({
        try: () => initCanopy(opts),
        catch: () => getCanopy() as MeadowInstance,
      });
    });

    // runSync — safe because initCanopy is synchronous; Effect is used for error handling composition
    return Effect.runSync(Effect.catchAll(program, () => Effect.succeed(getCanopy()))) as MeadowInstance | null;
  }, [opts]);

  // Keep options fresh synchronously (no useEffect)
  if (instance) instance.options = opts;

  return (
    <>
      {scriptSrc ? (
        <Script
          src={scriptSrc}
          data-site-id={siteId}
          data-endpoint={endpoint}
          strategy="afterInteractive"
        />
      ) : null}
      <CanopyContext.Provider value={instance}>{children}</CanopyContext.Provider>
    </>
  );
}

export function CanopyScript(props: MeadowOptions & { src?: string }) {
  const { siteId, endpoint, env, src = '/p.js' } = props;
  return <Script src={src} data-site-id={siteId} data-endpoint={endpoint} data-env={env} strategy="afterInteractive" />;
}

export function useCanopy(): MeadowInstance | null {
  const ctx = useContext(CanopyContext);
  if (ctx) return ctx;
  if (typeof window !== 'undefined') return getCanopy();
  return null;
}

export function useCanopyTrack() {
  const canopy = useCanopy();
  return useMemo(
    () => ({
      track: (name: string, props?: Record<string, unknown>) => {
        // Effect-wrapped emit for structured errors / future tracing
        const program = Effect.sync(() => {
          if (canopy) canopy.track(name, props);
          else coreTrack(name, props);
        });
        Effect.runSync(program);
      },
      pageview: (props?: Record<string, unknown>) => {
        const program = Effect.sync(() => {
          if (canopy) canopy.pageview(props);
          else corePageview(props);
        });
        Effect.runSync(program);
      },
    }),
    [canopy]
  );
}

export { initCanopy as initCanopy, coreTrack as track, corePageview as pageview, getCanopy };
export type { MeadowOptions, MeadowInstance };

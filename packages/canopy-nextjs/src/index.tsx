'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import Script from 'next/script';
import {
  initCanopy,
  track as coreTrack,
  pageview as corePageview,
  identify as coreIdentify,
  getCanopy,
  createCanopy,
  CanopyError,
  flushQueue,
  isInitialized,
  getOptions,
} from '@wnstn/canopy';
import type {
  CanopyOptions,
  CanopyInstance,
  CanopyHooks,
  CanopyEventName,
} from '@wnstn/canopy';

type CanopyContextValue = CanopyInstance | null;

const CanopyContext = createContext<CanopyContextValue>(null);

/**
 * CanopyProvider — Next.js wrapper for @wnstn/canopy
 *
 * Factory-based, no useState / useEffect.
 * Uses synchronous init with option sync inside render.
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
  debug,
  hooks,
  children,
  scriptSrc,
}: CanopyOptions & {
  children?: React.ReactNode;
  scriptSrc?: string | false;
}) {
  const opts = useMemo<CanopyOptions>(
    () => ({
      siteId,
      endpoint,
      env,
      manualPageview,
      disableOutbound,
      respectDnt,
      sampleRate,
      props,
      debug,
      hooks,
    }),
    [
      siteId,
      endpoint,
      env,
      manualPageview,
      disableOutbound,
      respectDnt,
      sampleRate,
      JSON.stringify(props),
      debug,
      hooks,
    ],
  );

  // Synchronous init — no useEffect; memo ensures single init per opts identity.
  const instance = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const existing = getCanopy();
    if (existing) {
      existing.options = opts;
      return existing;
    }

    try {
      return createCanopy(opts);
    } catch (error) {
      if (error instanceof CanopyError) {
        console.error('[canopy] init failed:', error.message);
        return getCanopy();
      }
      throw error;
    }
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
          data-env={env}
          strategy="afterInteractive"
        />
      ) : null}
      <CanopyContext.Provider value={instance}>{children}</CanopyContext.Provider>
    </>
  );
}

export function CanopyScript(props: CanopyOptions & { src?: string }) {
  const { siteId, endpoint, env, src = '/p.js' } = props;
  return <Script src={src} data-site-id={siteId} data-endpoint={endpoint} data-env={env} strategy="afterInteractive" />;
}

export function useCanopy(): CanopyInstance | null {
  const ctx = useContext(CanopyContext);
  if (ctx) return ctx;
  if (typeof window !== 'undefined') return getCanopy();
  return null;
}

/**
 * Hook for tracking custom events
 * Returns a stable track function that works before/after provider init
 */
export function useCanopyTrack() {
  const canopy = useCanopy();

  return useMemo(
    () => ({
      track: useCallback((name: CanopyEventName | string, props?: Record<string, unknown>) => {
        if (canopy) canopy.track(name, props);
        else coreTrack(name, props);
      }, [canopy]),
    }),
    [canopy],
  );
}

/**
 * Hook for tracking pageviews
 */
export function useCanopyPageview() {
  const canopy = useCanopy();

  return useMemo(
    () => ({
      pageview: useCallback((props?: Record<string, unknown>) => {
        if (canopy) canopy.pageview(props);
        else corePageview(props);
      }, [canopy]),
    }),
    [canopy],
  );
}

/**
 * Hook for identifying users
 */
export function useCanopyIdentify() {
  const canopy = useCanopy();

  return useMemo(
    () => ({
      identify: useCallback((props: Record<string, unknown>) => {
        if (canopy) canopy.identify(props);
        else coreIdentify(props);
      }, [canopy]),
    }),
    [canopy],
  );
}

/**
 * Hook for resetting the session
 */
export function useCanopyReset() {
  const canopy = useCanopy();

  return useMemo(
    () => ({
      reset: useCallback(() => {
        if (canopy) canopy.reset();
      }, [canopy]),
    }),
    [canopy],
  );
}

/**
 * Hook for accessing the full Canopy instance
 * Provides all methods: track, pageview, identify, reset, setDefaultProps, getSessionId
 */
export function useCanopyInstance() {
  const canopy = useCanopy();

  return useMemo(
    () => ({
      track: useCallback((name: CanopyEventName | string, props?: Record<string, unknown>) => {
        if (canopy) canopy.track(name, props);
        else coreTrack(name, props);
      }, [canopy]),
      pageview: useCallback((props?: Record<string, unknown>) => {
        if (canopy) canopy.pageview(props);
        else corePageview(props);
      }, [canopy]),
      identify: useCallback((props: Record<string, unknown>) => {
        if (canopy) canopy.identify(props);
        else coreIdentify(props);
      }, [canopy]),
      reset: useCallback(() => {
        if (canopy) canopy.reset();
      }, [canopy]),
      setDefaultProps: useCallback((props: Record<string, unknown>) => {
        if (canopy) canopy.setDefaultProps(props);
      }, [canopy]),
      getSessionId: useCallback(() => {
        return canopy?.getSessionId?.() ?? '';
      }, [canopy]),
      options: canopy?.options,
    }),
    [canopy],
  );
}

/**
 * Hook for checking if Canopy is initialized
 */
export function useCanopyInitialized(): boolean {
  const canopy = useCanopy();
  return canopy !== null;
}

/**
 * Hook for accessing options
 */
export function useCanopyOptions(): CanopyOptions | null {
  const canopy = useCanopy();
  return canopy?.options ?? null;
}

/**
 * Hook for manually flushing the queue
 */
export function useCanopyFlush() {
  return useCallback(() => {
    flushQueue();
  }, []);
}

// Re-export core functions and types
export {
  initCanopy,
  createCanopy,
  coreTrack as track,
  corePageview as pageview,
  coreIdentify as identify,
  getCanopy,
  CanopyError,
  flushQueue,
  isInitialized,
  getOptions,
};
export type {
  CanopyOptions,
  CanopyInstance,
  CanopyHooks,
  CanopyEventName,
};
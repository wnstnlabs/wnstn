import type {
  CanopyOptions,
  CanopyInstance,
  CanopyEventPayload,
  CanopyEventName,
  CanopyHooks,
  QueuedCall,
} from './types';
import { CanopyError } from './types';

const VERSION = '0.1.0';
let instance: CanopyInstance | null = null;
let queue: QueuedCall[] = [];
let sessionId: string | null = null;

function genId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as unknown as { randomUUID: () => string }).randomUUID();
  } catch {}
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getSessionId(): string {
  if (sessionId) return sessionId;
  sessionId = genId();
  return sessionId;
}

function respectsDnt(): boolean {
  if (typeof navigator === 'undefined') return false;
  const dnt = (navigator as unknown as { doNotTrack?: string }).doNotTrack ?? (window as unknown as { doNotTrack?: string }).doNotTrack ?? (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

function isBot(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /bot|crawl|spider|slurp|mediapartners/i.test(navigator.userAgent);
}

function getUrl(): string {
  try { return location.href; } catch { return ''; }
}
function getReferrer(): string {
  try { return document.referrer || ''; } catch { return ''; }
}

function buildPayload(event: Omit<CanopyEventPayload, 'v' | 's' | 'sid'>, opts: CanopyOptions): string {
  return JSON.stringify({
    v: VERSION,
    s: opts.siteId,
    sid: getSessionId(),
    env: opts.env,
    ...event,
    ts: Date.now(),
  });
}

function runHook<T>(
  hook: ((event: CanopyEventPayload, ...args: unknown[]) => T | Promise<T>) | undefined,
  event: CanopyEventPayload,
  ...args: unknown[]
): Promise<T | undefined> {
  if (!hook) return Promise.resolve(undefined);
  try {
    return Promise.resolve(hook(event, ...args)) as Promise<T | undefined>;
  } catch (e) {
    // Hook errors shouldn't break the main flow
    console.warn('[canopy] hook error:', e);
    return Promise.resolve(undefined);
  }
}

async function sendEvent(
  payload: string,
  endpoint: string,
  eventPayload: CanopyEventPayload,
  hooks: CanopyHooks | undefined,
  debug?: boolean,
): Promise<boolean> {
  const debugLog = debug ? console.log.bind(console, '[canopy]') : () => {};
  const debugWarn = debug ? console.warn.bind(console, '[canopy]') : () => {};

  // beforeSend hook - can modify or cancel
  const modified = await runHook(hooks?.beforeSend as any, eventPayload);
  if (modified === false) {
    debugLog('send cancelled by beforeSend hook');
    return false;
  }
  const finalPayload = modified && typeof modified === 'object' && 'n' in modified
    ? buildPayload(modified as Omit<CanopyEventPayload, 'v' | 's' | 'sid'>, { ...JSON.parse(payload) as CanopyOptions, siteId: JSON.parse(payload).s })
    : payload;

  let response: Response | null = null;
  let sent = false;
  let error: Error | null = null;

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([finalPayload], { type: 'application/json' });
      const ok = navigator.sendBeacon(endpoint, blob);
      if (ok) {
        debugLog('sent via sendBeacon', endpoint);
        sent = true;
      }
    }
  } catch (e) {
    debugWarn('sendBeacon failed', e);
    error = e as Error;
  }

  if (!sent) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: finalPayload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        credentials: 'omit',
      });
      response = res;
      debugLog('sent via fetch keepalive', endpoint);
      sent = true;
    } catch (e) {
      debugWarn('fetch keepalive failed', e);
      error = e as Error;
    }
  }

  const eventForHooks = modified && typeof modified === 'object' && 'n' in modified
    ? (modified as CanopyEventPayload)
    : eventPayload;

  if (sent) {
    await runHook(hooks?.afterSend as any, eventForHooks, response);
  } else if (error) {
    await runHook(hooks?.onError as any, eventForHooks, error);
  }

  return sent;
}

function shouldDrop(opts: CanopyOptions): boolean {
  if (opts.respectDnt !== false && respectsDnt()) return true;
  if (isBot()) return true;
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') return true;
  if (opts.sampleRate != null && Math.random() > opts.sampleRate) return true;
  return false;
}

function emit(name: string, props?: Record<string, unknown>, instanceOpts?: CanopyOptions) {
  const opts = instanceOpts ?? instance?.options;
  if (!opts?.siteId) return;
  if (shouldDrop(opts)) return;

  const endpoint = opts.endpoint ?? '/api/canopy/event';
  const debug = opts.debug;
  const hooks = opts.hooks;

  const base: Omit<CanopyEventPayload, 'v' | 's' | 'sid'> = {
    n: name,
    u: getUrl(),
    r: getReferrer() || undefined,
    p: typeof location !== 'undefined' ? location.pathname + location.search : undefined,
    t: typeof document !== 'undefined' ? document.title : undefined,
    w: typeof window !== 'undefined' ? window.innerWidth : undefined,
    props: { ...opts.props, ...props },
  };

  // Fire and forget - don't await
  sendEvent(buildPayload(base, opts), endpoint, { ...base, v: VERSION, s: opts.siteId, sid: getSessionId(), env: opts.env, ts: Date.now() }, hooks, debug).catch(() => {});
}

function attachAutoTracking(opts: CanopyOptions) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (opts.disableOutbound) return;

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!target) return;
    const href = target.getAttribute('href');
    if (!href) return;
    const isExternal = (() => {
      try {
        const url = new URL(target.href, location.href);
        return url.origin !== location.origin;
      } catch { return false; }
    })();
    if (!isExternal) return;
    emit('outbound', { href, text: target.innerText?.slice(0, 80) }, opts);
  }, { capture: true });

  const patch = (type: 'pushState' | 'replaceState') => {
    const orig = history[type] as unknown as (...args: unknown[]) => unknown;
    history[type] = function (...args: unknown[]) {
      const ret = orig.apply(this, args as never);
      queueMicrotask(() => emit('pageview', undefined, opts));
      return ret;
    };
  };
  try { patch('pushState'); patch('replaceState'); } catch {}
  window.addEventListener('popstate', () => emit('pageview', undefined, opts));
  window.addEventListener('hashchange', () => emit('pageview', undefined, opts));
}

function createInstance(options: CanopyOptions): CanopyInstance {
  const inst: CanopyInstance = {
    options,
    track: (name, props) => emit(name, props, options),
    pageview: (props) => emit('pageview', props, options),
    identify: (props) => emit('identify', props, options),
    reset: () => { sessionId = null; },
    setDefaultProps: (props) => { options.props = { ...options.props, ...props }; },
    getSessionId: () => getSessionId(),
  };
  return inst;
}

export function initCanopy(options: CanopyOptions): CanopyInstance {
  if (!options.siteId) {
    throw new CanopyError('siteId is required', 'CONFIG_ERROR', { field: 'siteId' });
  }
  if (typeof window !== 'undefined' && (window as unknown as { __canopy_init?: boolean }).__canopy_init) {
    if (instance) instance.options = { ...instance.options, ...options };
    return instance!;
  }
  if (typeof window !== 'undefined') (window as unknown as { __canopy_init?: boolean }).__canopy_init = true;

  instance = createInstance(options);

  // Flush queued calls made before init
  queue.forEach((call) => {
    try {
      if (call.type === 'track') instance?.track(call.name, call.props);
      else if (call.type === 'pageview') instance?.pageview(call.props);
      else if (call.type === 'identify') instance?.identify(call.props);
    } catch {}
  });
  queue = [];

  // Auto pageview (unless suppressed)
  if (!options.manualPageview && typeof window !== 'undefined') {
    if (document.readyState === 'complete') emit('pageview', undefined, options);
    else window.addEventListener('load', () => emit('pageview', undefined, options), { once: true });
    setTimeout(() => {
      if (document.readyState !== 'complete') emit('pageview', undefined, options);
    }, 300);
  }

  attachAutoTracking(options);

  // Expose globally for queue compat: window.canopy
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>;
    const prev = w['canopy'];
    if (typeof prev === 'function' && (prev as unknown as { q?: unknown[] }).q) {
      const q = (prev as unknown as { q: unknown[] }).q;
      q.forEach((args) => {
        if (Array.isArray(args) && typeof args[0] === 'string') emit(args[0] as string, args[1] as Record<string, unknown>, options);
      });
    }
    w['canopy'] = ((name: string, props?: Record<string, unknown>) => emit(name, props ?? {}, options)) as unknown;
    (w['canopy'] as unknown as Record<string, unknown>).track = instance.track;
    (w['canopy'] as unknown as Record<string, unknown>).pageview = instance.pageview;
    (w['canopy'] as unknown as Record<string, unknown>).identify = instance.identify;
  }

  return instance;
}

export function getCanopy(): CanopyInstance | null {
  return instance;
}

function enqueueCall(call: QueuedCall) {
  if (instance) {
    if (call.type === 'track') instance.track(call.name, call.props);
    else if (call.type === 'pageview') instance.pageview(call.props);
    else if (call.type === 'identify') instance.identify(call.props);
  } else {
    queue.push(call);
  }
}

export function track(name: string, props?: Record<string, unknown>) {
  enqueueCall({ name, props, type: 'track' });
}

export function pageview(props?: Record<string, unknown>) {
  enqueueCall({ name: 'pageview', props, type: 'pageview' });
}

export function identify(props?: Record<string, unknown>) {
  enqueueCall({ name: 'identify', props, type: 'identify' });
}

export function reset() {
  if (instance) instance.reset();
}

/**
 * Create a Canopy instance — alias for initCanopy with factory pattern
 */
export function createCanopy(options: CanopyOptions): CanopyInstance {
  return initCanopy(options);
}

/**
 * Track a custom event with automatic context enrichment
 * Helper for common tracking patterns
 */
export function trackEvent(name: string, props?: Record<string, unknown>) {
  track(name, props);
}

/**
 * Track a pageview with optional custom properties
 */
export function trackPageview(props?: Record<string, unknown>) {
  pageview(props);
}

/**
 * Identify a user with traits
 */
export function trackIdentify(props?: Record<string, unknown>) {
  identify(props);
}

/**
 * Configure default props that will be attached to all events
 */
export function setDefaultProps(props: Record<string, unknown>) {
  if (instance) {
    instance.setDefaultProps(props);
  }
}

/**
 * Get the current session ID
 */
export function getSessionIdPublic(): string {
  return getSessionId();
}

/**
 * Manually flush the event queue (useful for testing)
 */
export function flushQueue(): void {
  if (!instance) return;
  queue.forEach((call) => {
    try {
      if (call.type === 'track') instance?.track(call.name, call.props);
      else if (call.type === 'pageview') instance?.pageview(call.props);
      else if (call.type === 'identify') instance?.identify(call.props);
    } catch {}
  });
  queue = [];
}

/**
 * Check if Canopy has been initialized
 */
export function isInitialized(): boolean {
  return instance !== null;
}

/**
 * Get the current instance options (read-only)
 */
export function getOptions(): CanopyOptions | null {
  return instance?.options ?? null;
}

/**
 * Reset the SDK completely (for testing only)
 * This clears the instance, queue, and session
 */
export function __resetForTesting(): void {
  instance = null;
  queue = [];
  sessionId = null;
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__canopy_init = false;
    delete (window as unknown as Record<string, unknown>)['canopy'];
  }
}

export { CanopyError };
export type {
  CanopyOptions,
  CanopyInstance,
  CanopyEventPayload,
  CanopyEventName,
  CanopyHooks,
  QueuedCall,
};
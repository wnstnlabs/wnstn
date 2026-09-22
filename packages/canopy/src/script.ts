/**
 * Auto-initializing CDN script.
 * Usage: <script src="https://canopy.your.app/p.js" data-site-id="canopy_xxx" data-endpoint="https://canopy.your.app/api/canopy/event" async></script>
 * Reads data-* attrs from the current <script> tag and calls initCanopy.
 * Keeps gzip size minimal — no framework deps.
 */
import { initCanopy } from './index';

function autoInit() {
  if (typeof document === 'undefined') return;
  const el = (document.currentScript as HTMLScriptElement | null)
    ?? document.querySelector('script[data-site-id]') as HTMLScriptElement | null;
  if (!el) return;
  const siteId = el.getAttribute('data-site-id') || el.dataset.siteId || '';
  if (!siteId) return;
  const endpoint = el.getAttribute('data-endpoint') || el.dataset.endpoint || undefined;
  const env = el.getAttribute('data-env') || el.dataset.env || undefined;

  // Don't double-init
  if ((window as unknown as { __canopy_init?: boolean }).__canopy_init) return;

  initCanopy({
    siteId,
    endpoint,
    env,
    respectDnt: el.getAttribute('data-respect-dnt') !== 'false',
    disableOutbound: el.hasAttribute('data-disable-outbound'),
  });
}

// If parsed synchronously, init immediately; otherwise wait for DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }
  // Also attempt immediate (covers async script where currentScript is still set)
  try { autoInit(); } catch {}
}

// Expose for manual init after CDN loads: window.Canopy.init(...)
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).Canopy = { init: initCanopy };
}

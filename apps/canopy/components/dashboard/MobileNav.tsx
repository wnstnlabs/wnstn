'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/realtime', label: 'Realtime' },
  { href: '/dashboard/pages', label: 'Pages' },
  { href: '/dashboard/events', label: 'Events' },
  { href: '/dashboard/sources', label: 'Sources' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export function MobileNav({ siteId }: { siteId?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const withSite = (href: string) => {
    if (!siteId) return href;
    const url = new URL(href, 'http://dummy');
    url.searchParams.set('site', siteId);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden size-9 grid place-items-center rounded-lg border border-white/[0.09] bg-[#12151d] text-slate-200"
      >
        <span className="mono text-[14px]">☰</span>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/80" />
            <div className="absolute left-0 top-0 h-full w-[84%] max-w-[320px] bg-[#0e1118] border-r border-white/[0.08] flex flex-col">
              <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06]">
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                  <span className="size-7 rounded-lg bg-rose-500 text-white grid place-items-center font-semibold text-xs">◈</span>
                  <span className="font-semibold text-sm text-slate-100">canopy</span>
                </Link>
                <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded-lg border border-white/[0.09] text-slate-400">✕</button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {links.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={withSite(l.href)}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-3 py-2.5 text-[13px] font-medium ${active ? 'bg-rose-500/10 text-rose-200' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'}`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-white/[0.06]">
                <Link href="/" onClick={() => setOpen(false)} className="block text-center rounded-lg bg-rose-500 text-white py-2.5 text-[13px] font-medium hover:bg-rose-400">← Back to site</Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

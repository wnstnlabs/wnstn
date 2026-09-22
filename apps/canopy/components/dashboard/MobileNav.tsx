'use client';

import { useState } from 'react';
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

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden size-9 grid place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white"
      >
        <span className="mono text-[14px]">☰</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 h-full w-[84%] max-w-[320px] bg-[#0a0a0c] border-r border-white/[0.08] flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06]">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-xs">◯</span>
                <span className="font-semibold text-sm">canopy</span>
              </Link>
              <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded-lg border border-white/[0.08] text-zinc-400">✕</button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={withSite(l.href)}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-2.5 text-[13px] font-medium ${active ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-white/[0.06]">
              <Link href="/" onClick={() => setOpen(false)} className="block text-center rounded-xl bg-white text-zinc-900 py-2.5 text-sm font-medium">← Back to site</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

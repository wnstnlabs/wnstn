'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/DropdownMenu';
import { WorkspaceMenuItems } from './WorkspaceSwitcher';

type Org = { id: string; name: string; slug: string };

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/realtime', label: 'Realtime' },
  { href: '/dashboard/pages', label: 'Pages' },
  { href: '/dashboard/events', label: 'Events' },
  { href: '/dashboard/sources', label: 'Sources' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export function MobileNav({ siteId, orgs, activeId, activeName }: { siteId?: string; orgs: Org[]; activeId: string | null; activeName: string | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const displayName = activeName ?? orgs.find((o) => o.id === activeId)?.name ?? null;

  const withSite = (href: string) => {
    if (!siteId) return href;
    const url = new URL(href, 'http://dummy');
    url.searchParams.set('site', siteId);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open menu"
          className="md:hidden size-9 grid place-items-center rounded-lg border border-white/[0.09] bg-[#12151d] text-slate-200"
        >
          <span className="mono text-[14px]">☰</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="min-w-[200px] rounded-xl border-white/[0.08] bg-[#12151d] p-1.5">
        {orgs.length > 0 && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-300 focus:bg-white/[0.05]">
                {displayName && <span className="size-6 shrink-0 rounded-md border border-rose-500/20 bg-rose-500/15 text-[10px] font-semibold text-rose-300 grid place-items-center">{displayName.slice(0, 1).toUpperCase()}</span>}
                <span className="min-w-0 flex-1 truncate">{displayName ?? 'Workspace'}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent sideOffset={6} className="min-w-[220px] rounded-xl border-white/[0.08] bg-[#12151d] p-0 shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
                <WorkspaceMenuItems orgs={orgs} activeId={activeId} onDone={() => setOpen(false)} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="my-1.5 bg-white/[0.08]" />
          </>
        )}
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <DropdownMenuItem
              key={l.href}
              onSelect={() => router.push(withSite(l.href))}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-[13px] font-medium ${active ? 'bg-rose-500/10 text-rose-200 focus:bg-rose-500/10 focus:text-rose-200' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 focus:bg-white/[0.05] focus:text-slate-100'}`}
            >
              {l.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="my-1.5 bg-white/[0.08]" />
        <DropdownMenuItem
          onSelect={() => router.push('/')}
          className="cursor-pointer justify-center rounded-lg bg-rose-500 px-3 py-2.5 text-[13px] font-medium text-white hover:bg-rose-400 focus:bg-rose-500"
        >
          ← Back to site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

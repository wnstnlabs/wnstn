'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Overview', icon: '●' },
  { href: '/dashboard/realtime', label: 'Realtime', icon: '◷' },
  { href: '/dashboard/pages', label: 'Pages', icon: '▭' },
  { href: '/dashboard/events', label: 'Events', icon: '◎' },
  { href: '/dashboard/sources', label: 'Sources', icon: '↗' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export function SidebarNav({ liveCount }: { liveCount?: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="mt-2.5 space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href + (searchParams.get('site') ? `?site=${encodeURIComponent(searchParams.get('site')!)}` : '')}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] leading-none transition ${isActive ? 'bg-white text-zinc-900 font-[550] shadow-[0_1px_2px_rgba(0,0,0,0.12)]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]'}`}
          >
            <span className={`w-4 text-center mono text-[12px] leading-none ${isActive ? 'text-zinc-900' : ''}`}>{isActive && item.label === 'Overview' ? '●' : item.icon}</span>
            {item.label}
            {item.label === 'Realtime' && liveCount !== undefined && liveCount > 0 && (
              <span className={`ml-auto flex items-center gap-1 mono text-[11px] font-medium ${isActive ? 'text-zinc-900' : 'text-emerald-400'}`}>
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> {liveCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

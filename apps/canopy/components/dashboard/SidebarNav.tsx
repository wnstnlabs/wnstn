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
    <nav className="space-y-px">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href + (searchParams.get('site') ? `?site=${encodeURIComponent(searchParams.get('site')!)}` : '')}
            className={`relative flex items-center gap-3 px-4 py-2.5 text-[13px] leading-none transition ${
              isActive
                ? 'text-rose-300 font-medium bg-rose-500/[0.07]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-0 h-full w-[2px] bg-rose-500" />
            )}
            <span className={`w-4 text-center mono text-[12px] leading-none ${isActive ? 'text-rose-400' : 'text-slate-600'}`}>
              {isActive && item.label === 'Overview' ? '●' : item.icon}
            </span>
            {item.label}
            {item.label === 'Realtime' && liveCount !== undefined && liveCount > 0 && (
              <span
                className={`ml-auto flex items-center gap-1.5 mono text-[10px] font-medium tabular ${
                  isActive ? 'text-rose-300' : 'text-teal-400'
                }`}
              >
                <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" /> {liveCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

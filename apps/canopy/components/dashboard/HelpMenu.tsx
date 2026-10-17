'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { CircleHelp, BookOpen, Code2, Server, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';

const COMMUNITY_URL = process.env.NEXT_PUBLIC_COMMUNITY_URL;

function HelpItem({
  href,
  icon,
  external = false,
  children,
}: {
  href: string;
  icon: ReactNode;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-slate-300 outline-none cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05] transition-colors"
      >
        <span className="text-slate-500 shrink-0">{icon}</span>
        {children}
      </Link>
    </DropdownMenuItem>
  );
}

export function HelpMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Help"
          className="size-6 grid place-items-center rounded-md border border-white/[0.08] text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition shrink-0"
        >
          <CircleHelp className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={8} className="min-w-[210px] bg-[#12151d] border-white/[0.08]">
        <DropdownMenuLabel className="mono text-[10px] uppercase tracking-[0.14em] text-slate-500 font-medium">Docs</DropdownMenuLabel>
        <HelpItem href="/docs" icon={<BookOpen className="size-3.5" />}>Documentation</HelpItem>
        <HelpItem href="/docs/api" icon={<Code2 className="size-3.5" />}>API reference</HelpItem>
        <HelpItem href="/docs/self-host" icon={<Server className="size-3.5" />}>Self-hosting</HelpItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="mono text-[10px] uppercase tracking-[0.14em] text-slate-500 font-medium">Community</DropdownMenuLabel>
        {COMMUNITY_URL && (
          <HelpItem href={COMMUNITY_URL} external icon={<MessageCircle className="size-3.5" />}>Join the community</HelpItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
